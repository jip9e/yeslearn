import type { ParsedModelRef, ProviderName } from "./types";

// ── Known providers ──────────────────────────────────────────

const KNOWN_PROVIDERS: Set<string> = new Set([
    "github-copilot",
    "google-gemini-cli",
    "google-antigravity",
]);

// ── Default model lists per provider ─────────────────────────

const PROVIDER_MODELS: Record<ProviderName, string[]> = {
    "github-copilot": [
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4.1",
        "gpt-4.1-mini",
        "o4-mini",
        "claude-sonnet-4",
    ],
    "google-gemini-cli": [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
    ],
    "google-antigravity": [
        "claude-opus-4",
        "claude-sonnet-4",
        "gemini-2.5-pro",
        "gemini-2.5-flash",
    ],
};

// ── Parse "provider/model" ───────────────────────────────────

export function parseModelRef(ref: string): ParsedModelRef {
    const slashIndex = ref.indexOf("/");
    if (slashIndex === -1) {
        throw new Error(
            `Invalid model reference "${ref}". Expected format: "provider/model" (e.g. "github-copilot/gpt-4o")`
        );
    }

    const provider = ref.slice(0, slashIndex);
    const model = ref.slice(slashIndex + 1);

    if (!provider || !model) {
        throw new Error(`Invalid model reference "${ref}". Both provider and model are required.`);
    }

    if (!KNOWN_PROVIDERS.has(provider)) {
        throw new Error(
            `Unknown provider "${provider}". Known: ${[...KNOWN_PROVIDERS].join(", ")}`
        );
    }

    return { provider: provider as ProviderName, model };
}

// ── List available models for a provider ─────────────────────

export function getModelsForProvider(provider: ProviderName): string[] {
    return PROVIDER_MODELS[provider] || [];
}

// ── List all known providers ─────────────────────────────────

export function getKnownProviders(): ProviderName[] {
    return [...KNOWN_PROVIDERS] as ProviderName[];
}
