// ── Auth Profile Types ───────────────────────────────────────
// Discriminated union for all provider credential shapes.

export type ProviderName = "github-copilot" | "google-gemini-cli" | "google-antigravity";

export type AuthProfile =
    | {
        type: "token";
        provider: "github-copilot";
        token: string;
        email?: string;
        updatedAt: number;
    }
    | {
        type: "oauth";
        provider: "google-gemini-cli" | "google-antigravity";
        access: string;
        refresh: string;
        expires: number; // epoch ms
        projectId: string;
        email?: string;
        updatedAt: number;
    };

// ── On-disk store shape ──────────────────────────────────────

export interface ProfileStore {
    profiles: Record<string, AuthProfile>;
    order: Record<ProviderName, string[]>;
}

// ── Runtime-resolved auth output ─────────────────────────────

export type ResolvedAuth =
    | { provider: "github-copilot"; bearerToken: string }
    | { provider: "google-gemini-cli" | "google-antigravity"; token: string; projectId: string };

// ── Copilot runtime token cache ──────────────────────────────

export interface CopilotRuntimeToken {
    token: string;
    expires: number; // epoch ms
}

// ── Provider router output ───────────────────────────────────

export interface ParsedModelRef {
    provider: ProviderName;
    model: string;
}

// ── Error categories ─────────────────────────────────────────

export type AuthErrorCode =
    | "AUTH_REQUIRED"
    | "AUTH_EXPIRED"
    | "ACCESS_DENIED"
    | "QUOTA_EXCEEDED"
    | "MODEL_UNAVAILABLE"
    | "NETWORK_RETRYABLE";

export class AuthError extends Error {
    code: AuthErrorCode;

    constructor(code: AuthErrorCode, message: string) {
        super(message);
        this.name = "AuthError";
        this.code = code;
    }
}

// ── OAuth pending state (in-memory) ──────────────────────────

export interface OAuthPendingState {
    codeVerifier: string;
    state: string;
    provider: "google-gemini-cli" | "google-antigravity";
    createdAt: number;
}
