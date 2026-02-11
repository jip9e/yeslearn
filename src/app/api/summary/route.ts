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
            .map(c => `--- ${c.name} ---\n${c.text!.slice(0, 20000)}`)
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
                content: `You are a world-class academic study assistant. You create extremely detailed, university-level structured summaries that rival the best study tools.

**ALWAYS write your summaries in the SAME language as the source material.** If the source is in French, write in French. If in English, write in English. If in Arabic, write in Arabic. Match the language of the original content exactly.

Output your response as a JSON array of sections, each with "title" and "content" keys.

CRITICAL FORMATTING RULES for the "content" field:
- **ALWAYS write in the same language as the source material** — do NOT translate to another language
- Use rich **markdown**: ## subheaders within sections, **bold** for ALL key terms/definitions, bullet points, numbered lists, tables where appropriate
- Start each section with a 2-3 sentence overview paragraph explaining the significance/context
- Then provide DETAILED content with every important fact, definition, relationship, and mechanism
- Use markdown tables (|col1|col2|) for comparisons, classifications, or structured data
- Bold ALL technical terms, anatomical structures, chemical names, formulas, dates, proper nouns
- Include dimensions, measurements, and specific values when present in the source
- Subsections within content using ### headers
- Create 5-12 sections covering EVERY topic in the source material — do NOT skip or summarize away detail
- Each section should be LONG and thorough — 500-2000 words of content
- Preserve the logical structure and hierarchy of the original material
- End with a conclusion section highlighting clinical/practical importance

Example format:
[{"title": "Définition et Généralités", "content": "Le **terme** désigne...\n\n### Étymologie\n\nLe mot vient du latin...\n\n### Caractéristiques principales\n\n- **Point 1**: détail complet...\n- **Point 2**: détail complet...\n\n| Propriété | Valeur |\n|-----------|--------|\n| Taille | 15-20 cm |"}, {"title": "Anatomie Descriptive", "content": "..."}]

IMPORTANT: Return ONLY valid JSON, no markdown code fences, no extra text. Each section must be comprehensive — do NOT truncate or abbreviate.`,
            },
            {
                role: "user" as const,
                content: `Create an exhaustive, highly detailed academic summary of ALL the following learning materials. Cover every topic, subtopic, definition, measurement, and relationship. Do not skip any content:\n\n${contextText}`,
            },
        ];

        const result = await chatCompletion(model, messages, { maxTokens: 16384 });

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
