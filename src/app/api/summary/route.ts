import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { summaries, contentItems, settings } from "@/lib/db/schema";
import { generateId } from "@/lib/id";
import { eq } from "drizzle-orm";
import { chatCompletion } from "@/lib/ai/aiClient";
import { getDefaultProfile } from "@/lib/auth/tokenStore";

// POST /api/summary — generate AI summary for a space
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { spaceId, model: requestedModel } = body;

        if (!spaceId) {
            return NextResponse.json({ error: "spaceId is required" }, { status: 400 });
        }

        // Check providers
        const copilotConnected = !!getDefaultProfile("github-copilot");
        const geminiConnected = !!getDefaultProfile("google-gemini-cli");
        if (!copilotConnected && !geminiConnected) {
            return NextResponse.json(
                { error: "No AI provider connected. Go to Settings → AI Providers." },
                { status: 400 }
            );
        }

        const db = getDb();

        // Determine model
        let model = requestedModel;
        if (!model) {
            const setting = db.select().from(settings).where(eq(settings.key, "default-model")).get();
            model = setting?.value || (copilotConnected ? "gpt-4o" : "gemini-2.5-flash");
        }

        // Gather content
        const spaceContent = db
            .select({ name: contentItems.name, text: contentItems.extractedText })
            .from(contentItems)
            .where(eq(contentItems.spaceId, spaceId))
            .all();

        const contextText = spaceContent
            .filter(c => c.text)
            .map(c => `--- ${c.name} ---\n${c.text!.slice(0, 10000)}`)
            .join("\n\n");

        if (!contextText.trim()) {
            return NextResponse.json(
                { error: "No content in this space to summarize. Add some content first." },
                { status: 400 }
            );
        }

        const messages = [
            {
                role: "system" as const,
                content: `You are a premium study assistant that creates detailed, beautifully formatted summaries. Output your response as a JSON array of sections, each with "title" and "content" keys.

Rules for content formatting:
- Use **markdown** inside the "content" field: **bold** for key terms, bullet points for lists, numbered steps for processes
- Each section should be thorough (3-5 paragraphs or equivalent with bullet points)
- Create 4-8 sections covering all key topics comprehensively
- Start each section with a brief overview sentence, then dive into details
- Use analogies and examples where helpful

Example format:
[{"title": "Introduction to Topic", "content": "**Overview**: The topic covers...\\n\\n- **Key concept 1**: explanation\\n- **Key concept 2**: explanation\\n\\nThis is important because..."}, {"title": "Key Concepts", "content": "..."}]

IMPORTANT: Return ONLY valid JSON, no markdown code fences, no extra text.`,
            },
            {
                role: "user" as const,
                content: `Create a comprehensive study summary of the following learning materials:\n\n${contextText}`,
            },
        ];

        const result = await chatCompletion(model, messages);

        // Parse sections
        let sections: { title: string; content: string }[] = [];
        try {
            // Strip potential markdown code fences
            let cleaned = result.content.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
            }
            sections = JSON.parse(cleaned);
        } catch {
            // If parsing fails, create a single section
            sections = [{ title: "Summary", content: result.content }];
        }

        // Delete old summaries for this space
        db.delete(summaries).where(eq(summaries.spaceId, spaceId)).run();

        // Save new summaries
        const saved = sections.map(section => {
            const id = generateId();
            db.insert(summaries)
                .values({ id, spaceId, title: section.title, content: section.content })
                .run();
            return db.select().from(summaries).where(eq(summaries.id, id)).get();
        });

        return NextResponse.json({ summaries: saved, model: result.model }, { status: 201 });
    } catch (error) {
        console.error("POST /api/summary error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate summary" },
            { status: 500 }
        );
    }
}
