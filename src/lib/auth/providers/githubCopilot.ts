import type { AuthProfile, CopilotRuntimeToken } from "../types";
import { AuthError } from "../types";
import { getProfile, setProfile, getDefaultProfileId } from "../tokenStore";
import { withProfileLock } from "../refreshLock";

// ── Constants ────────────────────────────────────────────────

const COPILOT_CLIENT_ID = "Iv1.b507a08c87ecfe98";
const COPILOT_SCOPE = "read:user";
const DEVICE_CODE_URL = "https://github.com/login/device/code";
const ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
const COPILOT_TOKEN_URL = "https://api.github.com/copilot_internal/v2/token";

// ── In-memory runtime token cache ────────────────────────────

let runtimeTokenCache: CopilotRuntimeToken | null = null;

// ── Device code flow ─────────────────────────────────────────

export interface DeviceCodeResponse {
    device_code: string;
    user_code: string;
    verification_uri: string;
    expires_in: number;
    interval: number;
}

export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
    const res = await fetch(DEVICE_CODE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body: new URLSearchParams({
            client_id: COPILOT_CLIENT_ID,
            scope: COPILOT_SCOPE,
        }),
    });

    if (!res.ok) {
        throw new AuthError("NETWORK_RETRYABLE", `Device code request failed: ${res.status}`);
    }

    return res.json();
}

export interface PollResult {
    status: "pending" | "complete" | "expired" | "denied" | "slow_down";
    token?: string;
    interval?: number;
}

export async function pollAccessToken(
    deviceCode: string,
    currentInterval: number
): Promise<PollResult> {
    const res = await fetch(ACCESS_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body: new URLSearchParams({
            client_id: COPILOT_CLIENT_ID,
            device_code: deviceCode,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
    });

    if (!res.ok) {
        throw new AuthError("NETWORK_RETRYABLE", `Token poll failed: ${res.status}`);
    }

    const data = await res.json();

    if (data.access_token) {
        return { status: "complete", token: data.access_token };
    }

    switch (data.error) {
        case "authorization_pending":
            return { status: "pending" };
        case "slow_down":
            return { status: "slow_down", interval: currentInterval + 5 };
        case "expired_token":
            return { status: "expired" };
        case "access_denied":
            return { status: "denied" };
        default:
            throw new AuthError("NETWORK_RETRYABLE", `Unexpected poll error: ${data.error}`);
    }
}

// ── Save GitHub token as profile ─────────────────────────────

export function saveGitHubToken(token: string, email?: string): void {
    const profileId = getDefaultProfileId("github-copilot");
    const profile: AuthProfile = {
        type: "token",
        provider: "github-copilot",
        token,
        email,
        updatedAt: Date.now(),
    };
    setProfile(profileId, profile);

    // Clear runtime cache so next resolve fetches fresh
    runtimeTokenCache = null;
}

// ── Fetch GitHub user email ──────────────────────────────────

export async function fetchGitHubEmail(accessToken: string): Promise<string | undefined> {
    try {
        const res = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
                "User-Agent": "YesLearn-App",
            },
        });
        if (!res.ok) return undefined;
        const data = await res.json();
        return data.email || data.login || undefined;
    } catch {
        return undefined;
    }
}

// ── Runtime token exchange ───────────────────────────────────

async function exchangeRuntimeToken(githubToken: string): Promise<CopilotRuntimeToken> {
    const res = await fetch(COPILOT_TOKEN_URL, {
        headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/json",
            "User-Agent": "YesLearn-App",
        },
    });

    if (res.status === 401) {
        throw new AuthError("AUTH_EXPIRED", "GitHub token is no longer valid. Please reconnect.");
    }
    if (res.status === 403) {
        throw new AuthError("ACCESS_DENIED", "GitHub Copilot access denied. Check your subscription.");
    }
    if (!res.ok) {
        throw new AuthError("NETWORK_RETRYABLE", `Copilot token exchange failed: ${res.status}`);
    }

    const data = await res.json();
    return {
        token: data.token,
        expires: data.expires_at ? data.expires_at * 1000 : Date.now() + 30 * 60_000,
    };
}

// ── Get or refresh runtime token ─────────────────────────────

async function getOrExchangeRuntimeToken(githubToken: string): Promise<CopilotRuntimeToken> {
    // Cache hit — still valid (with 60s buffer)
    if (runtimeTokenCache && Date.now() < runtimeTokenCache.expires - 60_000) {
        return runtimeTokenCache;
    }

    const freshToken = await exchangeRuntimeToken(githubToken);
    runtimeTokenCache = freshToken;
    return freshToken;
}

// ── Resolve Copilot bearer token ─────────────────────────────

export async function resolveCopilotBearer(profileId?: string): Promise<{
    provider: "github-copilot";
    bearerToken: string;
}> {
    const pid = profileId || getDefaultProfileId("github-copilot");

    return withProfileLock(pid, async () => {
        const profile = getProfile(pid);
        if (!profile) {
            throw new AuthError(
                "AUTH_REQUIRED",
                "GitHub Copilot is not connected. Go to Settings → AI Providers to connect."
            );
        }
        if (profile.type !== "token") {
            throw new AuthError("AUTH_REQUIRED", "Invalid Copilot profile type.");
        }

        const runtime = await getOrExchangeRuntimeToken(profile.token);
        return { provider: "github-copilot" as const, bearerToken: runtime.token };
    });
}
