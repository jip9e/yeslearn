import { resolveCopilotBearer } from "../auth/providers/githubCopilot";
import { resolveGeminiAuth } from "../auth/providers/googleGeminiCli";
import { getDefaultProfile } from "../auth/tokenStore";
import type { ResolvedAuth } from "../auth/types";

// ── Types ────────────────────────────────────────────────────

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ChatCompletionResult {
    content: string;
    model: string;
    provider: string;
}

export interface ModelInfo {
    id: string;
    name: string;
    provider: string;
    capabilities: string[];
    vendor?: string;
    category?: string;
}

// ── Copilot Chat Completions ─────────────────────────────────

const COPILOT_CHAT_URL = "https://api.individual.githubcopilot.com/chat/completions";
const COPILOT_MODELS_URL = "https://api.individual.githubcopilot.com/models";

async function copilotChatCompletion(
    model: string,
    messages: ChatMessage[],
    options?: { maxTokens?: number }
): Promise<ChatCompletionResult> {
    const auth = await resolveCopilotBearer();

    const res = await fetch(COPILOT_CHAT_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${auth.bearerToken}`,
            "Content-Type": "application/json",
            "Copilot-Integration-Id": "vscode-chat",
            "Editor-Version": "vscode/1.99.0",
            "Editor-Plugin-Version": "copilot-chat/0.26.0",
            "User-Agent": "YesLearn-App",
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.4,
            top_p: 1,
            max_tokens: options?.maxTokens ?? 4096,
            stream: false,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Copilot chat failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    return {
        content: choice?.message?.content || "No response generated.",
        model: data.model || model,
        provider: "github-copilot",
    };
}

async function fetchCopilotModels(): Promise<ModelInfo[]> {
    try {
        const auth = await resolveCopilotBearer();
        const res = await fetch(COPILOT_MODELS_URL, {
            headers: {
                Authorization: `Bearer ${auth.bearerToken}`,
                Accept: "application/json",
                "Copilot-Integration-Id": "vscode-chat",
                "Editor-Version": "vscode/1.99.0",
                "Editor-Plugin-Version": "copilot-chat/0.26.0",
                "User-Agent": "YesLearn-App",
            },
        });

        if (!res.ok) {
            console.warn(`[Models] Copilot API returned ${res.status}, using fallback list`);
            return getDefaultCopilotModels();
        }

        const json = await res.json();
        // API returns { data: [...], object: "list" }
        const models = Array.isArray(json) ? json : (json.data ?? []);

        if (Array.isArray(models) && models.length > 0) {
            const chatModels = models
                .filter((m: any) => {
                    const isChat = m.capabilities?.type === "chat";
                    const isPickerVisible = m.model_picker_enabled === true;
                    // Only include models usable via /chat/completions
                    const supportsChat = !m.supported_endpoints || m.supported_endpoints.includes("/chat/completions");
                    return isChat && isPickerVisible && supportsChat;
                })
                .map((m: any) => ({
                    id: m.id,
                    name: m.name || m.id,
                    provider: "github-copilot",
                    capabilities: ["chat"],
                    vendor: m.vendor || "",
                    category: m.model_picker_category || "",
                }));

            console.log(`[Models] Fetched ${chatModels.length} chat models from Copilot API (${models.length} total)`);
            return chatModels.length > 0 ? chatModels : getDefaultCopilotModels();
        }

        console.warn("[Models] Unexpected Copilot API response format, using fallback list");
        return getDefaultCopilotModels();
    } catch (err) {
        console.warn("[Models] Copilot models fetch failed, using fallback list:", err instanceof Error ? err.message : "unknown");
        return getDefaultCopilotModels();
    }
}

function getDefaultCopilotModels(): ModelInfo[] {
    return [
        // OpenAI — powerful
        { id: "gpt-5.2", name: "GPT-5.2", provider: "github-copilot", capabilities: ["chat"], vendor: "OpenAI", category: "versatile" },
        { id: "gpt-5.1", name: "GPT-5.1", provider: "github-copilot", capabilities: ["chat"], vendor: "OpenAI", category: "versatile" },
        { id: "gpt-5", name: "GPT-5", provider: "github-copilot", capabilities: ["chat"], vendor: "Azure OpenAI", category: "versatile" },
        { id: "gpt-5-mini", name: "GPT-5 mini", provider: "github-copilot", capabilities: ["chat"], vendor: "Azure OpenAI", category: "lightweight" },
        { id: "gpt-4.1", name: "GPT-4.1", provider: "github-copilot", capabilities: ["chat"], vendor: "Azure OpenAI", category: "versatile" },
        { id: "gpt-4o", name: "GPT-4o", provider: "github-copilot", capabilities: ["chat"], vendor: "Azure OpenAI", category: "versatile" },
        // Anthropic
        { id: "claude-opus-4.6", name: "Claude Opus 4.6", provider: "github-copilot", capabilities: ["chat"], vendor: "Anthropic", category: "powerful" },
        { id: "claude-opus-4.5", name: "Claude Opus 4.5", provider: "github-copilot", capabilities: ["chat"], vendor: "Anthropic", category: "powerful" },
        { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "github-copilot", capabilities: ["chat"], vendor: "Anthropic", category: "versatile" },
        { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "github-copilot", capabilities: ["chat"], vendor: "Anthropic", category: "versatile" },
        { id: "claude-haiku-4.5", name: "Claude Haiku 4.5", provider: "github-copilot", capabilities: ["chat"], vendor: "Anthropic", category: "versatile" },
        // Google
        { id: "gemini-3-pro-preview", name: "Gemini 3 Pro (Preview)", provider: "github-copilot", capabilities: ["chat"], vendor: "Google", category: "powerful" },
        { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Preview)", provider: "github-copilot", capabilities: ["chat"], vendor: "Google", category: "lightweight" },
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "github-copilot", capabilities: ["chat"], vendor: "Google", category: "powerful" },
        // xAI
        { id: "grok-code-fast-1", name: "Grok Code Fast 1", provider: "github-copilot", capabilities: ["chat"], vendor: "xAI", category: "lightweight" },
        // Microsoft
        { id: "oswe-vscode-prime", name: "Raptor mini (Preview)", provider: "github-copilot", capabilities: ["chat"], vendor: "Azure OpenAI", category: "versatile" },
    ];
}

// ── Gemini Chat via generativelanguage API ────────────────────

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

async function geminiChatCompletion(
    model: string,
    messages: ChatMessage[],
    options?: { maxTokens?: number }
): Promise<ChatCompletionResult> {
    const auth = await resolveGeminiAuth();

    // Convert ChatMessage format to Gemini's format
    const systemInstruction = messages.find(m => m.role === "system");
    const conversationMessages = messages.filter(m => m.role !== "system");

    const contents = conversationMessages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = { contents };
    if (systemInstruction) {
        body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
    }
    body.generationConfig = { temperature: 0.4, maxOutputTokens: options?.maxTokens ?? 8192 };

    const res = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini chat failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    return {
        content: textContent,
        model,
        provider: "google-gemini-cli",
    };
}

async function fetchGeminiModels(): Promise<ModelInfo[]> {
    try {
        const auth = await resolveGeminiAuth();
        const res = await fetch(`${GEMINI_API_BASE}/models`, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
                Accept: "application/json",
            },
        });

        if (!res.ok) return getDefaultGeminiModels();

        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
            return data.models
                .filter((m: { name: string; supportedGenerationMethods?: string[] }) =>
                    m.supportedGenerationMethods?.includes("generateContent")
                )
                .map((m: { name: string; displayName?: string; supportedGenerationMethods?: string[] }) => ({
                    id: m.name.replace("models/", ""),
                    name: m.displayName || m.name.replace("models/", ""),
                    provider: "google-gemini-cli",
                    capabilities: m.supportedGenerationMethods || ["generateContent"],
                }))
                .slice(0, 20); // limit to top 20
        }

        return getDefaultGeminiModels();
    } catch {
        return getDefaultGeminiModels();
    }
}

function getDefaultGeminiModels(): ModelInfo[] {
    return [
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google-gemini-cli", capabilities: ["chat"] },
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google-gemini-cli", capabilities: ["chat"] },
        { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google-gemini-cli", capabilities: ["chat"] },
    ];
}

// ── Unified dispatch ─────────────────────────────────────────

export async function chatCompletion(
    model: string,
    messages: ChatMessage[],
    options?: { maxTokens?: number }
): Promise<ChatCompletionResult> {
    // Route gemini-* models to the direct Gemini API only if the
    // Google Gemini CLI provider is connected. Otherwise, they'll
    // go through Copilot which also serves Gemini models.
    if (isGeminiModel(model) && !!getDefaultProfile("google-gemini-cli")) {
        return geminiChatCompletion(model, messages, options);
    }
    // Default to Copilot
    return copilotChatCompletion(model, messages, options);
}

function isGeminiModel(model: string): boolean {
    return model.startsWith("gemini-") || model.startsWith("models/gemini");
}

// ── Fetch all available models ───────────────────────────────

export async function fetchAllModels(): Promise<ModelInfo[]> {
    const results: ModelInfo[] = [];
    const promises: Promise<void>[] = [];

    // Check which providers are connected
    const copilotProfile = getDefaultProfile("github-copilot");
    const geminiProfile = getDefaultProfile("google-gemini-cli");

    if (copilotProfile) {
        promises.push(
            fetchCopilotModels().then(models => { results.push(...models); })
        );
    }

    if (geminiProfile) {
        promises.push(
            fetchGeminiModels().then(models => { results.push(...models); })
        );
    }

    await Promise.allSettled(promises);
    return results;
}
