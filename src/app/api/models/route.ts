import { NextResponse } from "next/server";
import { fetchAllModels } from "@/lib/ai/aiClient";

// GET /api/models — fetch available models from connected providers
export async function GET() {
    try {
        const models = await fetchAllModels();

        if (models.length === 0) {
            return NextResponse.json({
                models: [],
                message: "No AI providers connected. Go to Settings → AI Providers to connect.",
            });
        }

        return NextResponse.json({ models });
    } catch (error) {
        console.error("Models fetch error:", error instanceof Error ? error.message : "unknown");
        return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
    }
}
