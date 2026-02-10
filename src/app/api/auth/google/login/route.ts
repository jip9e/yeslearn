import { NextRequest, NextResponse } from "next/server";
import { startGeminiLogin } from "@/lib/auth/providers/googleGeminiCli";
import { startAntigravityLogin } from "@/lib/auth/providers/googleAntigravity";

// POST /api/auth/google/login
// Starts Google OAuth flow for either gemini-cli or antigravity
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { provider } = body;

        if (provider !== "google-gemini-cli" && provider !== "google-antigravity") {
            return NextResponse.json(
                { error: "provider must be 'google-gemini-cli' or 'google-antigravity'" },
                { status: 400 }
            );
        }

        const result =
            provider === "google-gemini-cli"
                ? await startGeminiLogin()
                : await startAntigravityLogin();

        return NextResponse.json({
            authUrl: result.authUrl,
            state: result.state,
        });
    } catch (error) {
        console.error("Google OAuth login start error:", error instanceof Error ? error.message : "unknown");
        return NextResponse.json({ error: "Failed to start login flow" }, { status: 500 });
    }
}
