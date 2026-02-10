import { NextRequest, NextResponse } from "next/server";
import { pollAccessToken, saveGitHubToken, fetchGitHubEmail } from "@/lib/auth/providers/githubCopilot";

// POST /api/auth/github-copilot/poll
// Polls GitHub for device code completion
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { deviceCode, interval } = body;

        if (!deviceCode) {
            return NextResponse.json({ error: "deviceCode is required" }, { status: 400 });
        }

        const result = await pollAccessToken(deviceCode, interval || 5);

        if (result.status === "complete" && result.token) {
            // Fetch user email
            const email = await fetchGitHubEmail(result.token);

            // Save profile
            saveGitHubToken(result.token, email);

            return NextResponse.json({
                status: "complete",
                email,
            });
        }

        return NextResponse.json({
            status: result.status,
            interval: result.interval,
        });
    } catch (error) {
        console.error("Poll error:", error instanceof Error ? error.message : "unknown");
        return NextResponse.json(
            { error: "Poll failed", status: "error" },
            { status: 500 }
        );
    }
}
