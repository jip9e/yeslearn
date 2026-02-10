import { NextResponse } from "next/server";
import { requestDeviceCode } from "@/lib/auth/providers/githubCopilot";

// POST /api/auth/github-copilot/device-code
// Starts the GitHub device login flow
export async function POST() {
    try {
        const result = await requestDeviceCode();
        return NextResponse.json({
            userCode: result.user_code,
            verificationUri: result.verification_uri,
            deviceCode: result.device_code,
            expiresIn: result.expires_in,
            interval: result.interval,
        });
    } catch (error) {
        console.error("Device code request failed:", error instanceof Error ? error.message : "unknown");
        return NextResponse.json({ error: "Failed to start login flow" }, { status: 500 });
    }
}
