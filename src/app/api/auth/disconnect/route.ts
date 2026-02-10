import { NextRequest, NextResponse } from "next/server";
import { deleteProfile, getDefaultProfileId } from "@/lib/auth/tokenStore";
import type { ProviderName } from "@/lib/auth/types";

// POST /api/auth/disconnect
// Disconnects a provider by deleting its profile
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { provider } = body;

        const validProviders: ProviderName[] = ["github-copilot", "google-gemini-cli", "google-antigravity"];
        if (!validProviders.includes(provider)) {
            return NextResponse.json(
                { error: `Invalid provider. Must be one of: ${validProviders.join(", ")}` },
                { status: 400 }
            );
        }

        const profileId = getDefaultProfileId(provider);
        const deleted = deleteProfile(profileId);

        return NextResponse.json({
            success: true,
            deleted,
            provider,
        });
    } catch (error) {
        console.error("Disconnect error:", error instanceof Error ? error.message : "unknown");
        return NextResponse.json({ error: "Failed to disconnect provider" }, { status: 500 });
    }
}
