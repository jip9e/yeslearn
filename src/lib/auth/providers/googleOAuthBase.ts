import http from "http";
import crypto from "crypto";
import type { AuthProfile, OAuthPendingState } from "../types";
import { AuthError } from "../types";
import { getProfile, setProfile, getDefaultProfileId } from "../tokenStore";
import { withProfileLock } from "../refreshLock";

// ── PKCE helpers ─────────────────────────────────────────────

function generateCodeVerifier(): string {
    return crypto.randomBytes(64).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
    return crypto.createHash("sha256").update(verifier).digest("base64url");
}

function generateState(): string {
    return crypto.randomBytes(32).toString("hex");
}

// ── In-memory pending state (one per provider) ───────────────

const pendingFlows = new Map<string, OAuthPendingState>();
const callbackServers = new Map<string, http.Server>();

// ── Provider config ──────────────────────────────────────────

export interface GoogleOAuthConfig {
    provider: "google-gemini-cli" | "google-antigravity";
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    port: number;
    callbackPath: string;
    scopes: string[];
}

// ── Start OAuth flow ─────────────────────────────────────────

export async function startGoogleOAuthFlow(config: GoogleOAuthConfig): Promise<{
    authUrl: string;
    state: string;
}> {
    // Clean up any previous server for this provider
    await stopCallbackServer(config.provider);

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store pending state
    pendingFlows.set(config.provider, {
        codeVerifier,
        state,
        provider: config.provider,
        createdAt: Date.now(),
    });

    // Build authorization URL
    const params = new URLSearchParams({
        client_id: config.clientId,
        response_type: "code",
        redirect_uri: config.redirectUri,
        scope: config.scopes.join(" "),
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state,
        access_type: "offline",
        prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Start callback server
    await startCallbackServer(config);

    return { authUrl, state };
}

// ── Callback server ──────────────────────────────────────────

function startCallbackServer(config: GoogleOAuthConfig): Promise<void> {
    return new Promise((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
            const url = new URL(req.url || "/", `http://localhost:${config.port}`);

            if (url.pathname !== config.callbackPath) {
                res.writeHead(404);
                res.end("Not found");
                return;
            }

            const code = url.searchParams.get("code");
            const returnedState = url.searchParams.get("state");
            const error = url.searchParams.get("error");

            if (error) {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(callbackHtml("Authorization Failed", `Error: ${error}. You can close this tab.`));
                await stopCallbackServer(config.provider);
                return;
            }

            // Validate state
            const pending = pendingFlows.get(config.provider);
            if (!pending || returnedState !== pending.state) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.end(callbackHtml("Security Error", "State mismatch — possible CSRF attack. Please try again."));
                await stopCallbackServer(config.provider);
                return;
            }

            if (!code) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.end(callbackHtml("Error", "No authorization code received."));
                await stopCallbackServer(config.provider);
                return;
            }

            // Exchange code for tokens
            try {
                const tokens = await exchangeCodeForTokens(config, code, pending.codeVerifier);

                // Fetch email
                const email = await fetchGoogleEmail(tokens.access_token);

                // Discover project
                const projectId = await discoverProject(tokens.access_token, config.provider);

                // Save profile
                const profileId = getDefaultProfileId(config.provider);
                const profile: AuthProfile = {
                    type: "oauth",
                    provider: config.provider,
                    access: tokens.access_token,
                    refresh: tokens.refresh_token,
                    expires: Date.now() + tokens.expires_in * 1000,
                    projectId,
                    email,
                    updatedAt: Date.now(),
                };
                setProfile(profileId, profile);

                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(
                    callbackHtml(
                        "Connected!",
                        `${config.provider === "google-gemini-cli" ? "Google Gemini" : "Google Antigravity"} connected${email ? ` as ${email}` : ""}. You can close this tab and return to YesLearn.`
                    )
                );
            } catch (err) {
                console.error(`OAuth token exchange error (${config.provider}):`, err instanceof Error ? err.message : "unknown");
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end(callbackHtml("Error", "Token exchange failed. Please try again."));
            }

            // Clean up
            pendingFlows.delete(config.provider);
            await stopCallbackServer(config.provider);
        });

        server.on("error", (err) => {
            reject(new AuthError("NETWORK_RETRYABLE", `Callback server failed to start: ${err.message}`));
        });

        server.listen(config.port, "127.0.0.1", () => {
            callbackServers.set(config.provider, server);
            resolve();
        });

        // Auto-shutdown after 2 minutes
        setTimeout(async () => {
            await stopCallbackServer(config.provider);
        }, 120_000);
    });
}

async function stopCallbackServer(provider: string): Promise<void> {
    const server = callbackServers.get(provider);
    if (server) {
        return new Promise((resolve) => {
            server.close(() => resolve());
            callbackServers.delete(provider);
        });
    }
}

// ── Token exchange ───────────────────────────────────────────

interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

async function exchangeCodeForTokens(
    config: GoogleOAuthConfig,
    code: string,
    codeVerifier: string
): Promise<TokenResponse> {
    const body: Record<string, string> = {
        client_id: config.clientId,
        code,
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
        code_verifier: codeVerifier,
    };
    if (config.clientSecret) {
        body.client_secret = config.clientSecret;
    }

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new AuthError("NETWORK_RETRYABLE", `Token exchange failed (${res.status}): ${errText}`);
    }

    return res.json();
}

// ── Token refresh ────────────────────────────────────────────

export async function refreshGoogleTokens(
    config: GoogleOAuthConfig,
    profileId: string
): Promise<void> {
    await withProfileLock(profileId, async () => {
        const profile = getProfile(profileId);
        if (!profile || profile.type !== "oauth") {
            throw new AuthError("AUTH_REQUIRED", "Profile not found or wrong type.");
        }

        // Re-check if still expired inside lock
        if (Date.now() < profile.expires - 60_000) {
            return; // Another caller already refreshed
        }

        const body: Record<string, string> = {
            client_id: config.clientId,
            grant_type: "refresh_token",
            refresh_token: profile.refresh,
        };
        if (config.clientSecret) {
            body.client_secret = config.clientSecret;
        }

        const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(body),
        });

        if (res.status === 401 || res.status === 400) {
            throw new AuthError("AUTH_EXPIRED", "Refresh token expired. Please reconnect.");
        }
        if (!res.ok) {
            throw new AuthError("NETWORK_RETRYABLE", `Token refresh failed: ${res.status}`);
        }

        const data = await res.json();

        const updated: AuthProfile = {
            ...profile,
            access: data.access_token,
            expires: Date.now() + data.expires_in * 1000,
            refresh: data.refresh_token || profile.refresh, // Use rotated if provided
            updatedAt: Date.now(),
        };

        setProfile(profileId, updated);
    });
}

// ── Resolve Google auth bundle ───────────────────────────────

export async function resolveGoogleBundle(
    config: GoogleOAuthConfig,
    profileId?: string
): Promise<{ provider: "google-gemini-cli" | "google-antigravity"; token: string; projectId: string }> {
    const pid = profileId || getDefaultProfileId(config.provider);

    const profile = getProfile(pid);
    if (!profile || profile.type !== "oauth") {
        throw new AuthError(
            "AUTH_REQUIRED",
            `${config.provider} is not connected. Go to Settings → AI Providers to connect.`
        );
    }

    // Auto-refresh if expiring within 60 seconds
    if (Date.now() >= profile.expires - 60_000) {
        await refreshGoogleTokens(config, pid);
    }

    // Re-read after possible refresh
    const freshProfile = getProfile(pid);
    if (!freshProfile || freshProfile.type !== "oauth") {
        throw new AuthError("AUTH_REQUIRED", "Profile lost during refresh.");
    }

    return {
        provider: config.provider,
        token: freshProfile.access,
        projectId: freshProfile.projectId,
    };
}

// ── Email fetch ──────────────────────────────────────────────

async function fetchGoogleEmail(accessToken: string): Promise<string | undefined> {
    try {
        const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return undefined;
        const data = await res.json();
        return data.email || undefined;
    } catch {
        return undefined;
    }
}

// ── Project discovery ────────────────────────────────────────

async function discoverProject(accessToken: string, provider: string): Promise<string> {
    // 1. Check env variable
    const envProject = process.env.GOOGLE_CLOUD_PROJECT;
    if (envProject) return envProject;

    // 2. Try cloudcode discovery
    try {
        const res = await fetch(
            "https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }
        );
        if (res.ok) {
            const data = await res.json();
            if (data.projectId) return data.projectId;
        }
    } catch {
        // Fall through
    }

    // 3. Try onboard
    try {
        const res = await fetch(
            "https://cloudcode-pa.googleapis.com/v1internal:onboardUser",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }
        );
        if (res.ok) {
            const data = await res.json();
            if (data.projectId) return data.projectId;
        }
    } catch {
        // Fall through
    }

    // 4. Default project placeholder
    return `yeslearn-${provider}-default`;
}

// ── Callback HTML ────────────────────────────────────────────

function callbackHtml(title: string, message: string): string {
    return `<!DOCTYPE html>
<html>
<head><title>${title}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa; }
  .card { text-align: center; padding: 40px; background: white; border-radius: 16px; border: 1px solid #e5e5e5; max-width: 400px; }
  h1 { font-size: 22px; margin: 0 0 8px 0; }
  p { font-size: 14px; color: #666; margin: 0; }
</style>
</head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body>
</html>`;
}

// ── Check if a flow is pending ───────────────────────────────

export function isFlowPending(provider: string): boolean {
    return pendingFlows.has(provider);
}
