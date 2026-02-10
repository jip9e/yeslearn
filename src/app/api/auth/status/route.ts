import { NextResponse } from "next/server";
import { getDefaultProfile } from "@/lib/auth/tokenStore";
import type { ProviderName } from "@/lib/auth/types";

// GET /api/auth/status
// Returns connection status for all providers
export async function GET() {
    try {
        const providers: ProviderName[] = ["github-copilot", "google-gemini-cli", "google-antigravity"];
        const statuses: Record<string, {
            connected: boolean;
            email?: string;
            provider: string;
            expiresAt?: number;
            updatedAt?: number;
        }> = {};

        for (const provider of providers) {
            const profile = getDefaultProfile(provider);
            if (profile) {
                statuses[provider] = {
                    connected: true,
                    email: profile.email,
                    provider: profile.provider,
                    expiresAt: profile.type === "oauth" ? profile.expires : undefined,
                    updatedAt: profile.updatedAt,
                };
            } else {
                statuses[provider] = {
                    connected: false,
                    provider,
                };
            }
        }

        return NextResponse.json(statuses);
    } catch (error) {
        console.error("Auth status error:", error instanceof Error ? error.message : "unknown");
        return NextResponse.json({ error: "Failed to get auth status" }, { status: 500 });
    }
}
