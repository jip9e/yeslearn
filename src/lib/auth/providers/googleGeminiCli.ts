import type { GoogleOAuthConfig } from "./googleOAuthBase";
import { startGoogleOAuthFlow, resolveGoogleBundle } from "./googleOAuthBase";

// ── Gemini CLI OAuth config ──────────────────────────────────
// Uses Google Cloud SDK's public OAuth client (same as gcloud CLI / Gemini CLI).
// Env vars GOOGLE_GEMINI_CLIENT_ID / GOOGLE_GEMINI_CLIENT_SECRET are optional overrides.

const NATIVE_CLIENT_ID = "764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com";
const NATIVE_CLIENT_SECRET = "d-FL95Q19q7MQmFpd7hHD0Ty";

const GEMINI_CONFIG: GoogleOAuthConfig = {
    provider: "google-gemini-cli",
    clientId: process.env.GOOGLE_GEMINI_CLIENT_ID || NATIVE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_GEMINI_CLIENT_SECRET || NATIVE_CLIENT_SECRET,
    redirectUri: "http://localhost:8085/oauth2callback",
    port: 8085,
    callbackPath: "/oauth2callback",
    scopes: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ],
};

export function getGeminiConfig(): GoogleOAuthConfig {
    return { ...GEMINI_CONFIG };
}

export async function startGeminiLogin() {
    return startGoogleOAuthFlow(getGeminiConfig());
}

export async function resolveGeminiAuth(profileId?: string) {
    return resolveGoogleBundle(getGeminiConfig(), profileId);
}
