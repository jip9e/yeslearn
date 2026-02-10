import type { ResolvedAuth, ProviderName } from "./types";
import { AuthError } from "./types";
import { resolveCopilotBearer } from "./providers/githubCopilot";
import { resolveGeminiAuth } from "./providers/googleGeminiCli";
import { resolveAntigravityAuth } from "./providers/googleAntigravity";

// ── Single entry point for auth resolution ───────────────────
// Always returns a fresh, ready-to-use auth bundle for the given provider.

export async function resolveAuth(
    provider: string,
    profileId?: string
): Promise<ResolvedAuth> {
    switch (provider) {
        case "github-copilot":
            return resolveCopilotBearer(profileId);

        case "google-gemini-cli":
            return resolveGeminiAuth(profileId);

        case "google-antigravity":
            return resolveAntigravityAuth(profileId);

        default:
            throw new AuthError(
                "AUTH_REQUIRED",
                `Unsupported provider: "${provider}". Supported: github-copilot, google-gemini-cli, google-antigravity`
            );
    }
}

// ── Re-export types for convenience ──────────────────────────

export type { ResolvedAuth, ProviderName };
export { AuthError };
