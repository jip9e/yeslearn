import type { GoogleOAuthConfig } from "./googleOAuthBase";
import { startGoogleOAuthFlow, resolveGoogleBundle } from "./googleOAuthBase";

// ── Antigravity OAuth config ─────────────────────────────────
// Uses Google Cloud Code's public OAuth client (same family as Antigravity/Jules tools).
// Env vars GOOGLE_ANTIGRAVITY_CLIENT_ID / GOOGLE_ANTIGRAVITY_CLIENT_SECRET are optional overrides.

const NATIVE_CLIENT_ID = "305457953989-cs4dbhi0g3ivdsdo8vvkifo7cfsaqqpo.apps.googleusercontent.com";
const NATIVE_CLIENT_SECRET = "GOCSPX-xxxxxxxxxxxxxxxxxxxx";

const ANTIGRAVITY_CONFIG: GoogleOAuthConfig = {
    provider: "google-antigravity",
    clientId: process.env.GOOGLE_ANTIGRAVITY_CLIENT_ID || NATIVE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_ANTIGRAVITY_CLIENT_SECRET || NATIVE_CLIENT_SECRET,
    redirectUri: "http://localhost:51121/oauth-callback",
    port: 51121,
    callbackPath: "/oauth-callback",
    scopes: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/cclog",
        "https://www.googleapis.com/auth/experimentsandconfigs",
    ],
};

export function getAntigravityConfig(): GoogleOAuthConfig {
    return { ...ANTIGRAVITY_CONFIG };
}

export async function startAntigravityLogin() {
    return startGoogleOAuthFlow(getAntigravityConfig());
}

export async function resolveAntigravityAuth(profileId?: string) {
    return resolveGoogleBundle(getAntigravityConfig(), profileId);
}
