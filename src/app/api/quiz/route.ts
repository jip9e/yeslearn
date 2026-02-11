import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { quizQuestions, contentItems, settings } from "@/lib/db/schema";
import { generateId } from "@/lib/id";
import { eq } from "drizzle-orm";
import { chatCompletion } from "@/lib/ai/aiClient";
import { getDefaultProfile } from "@/lib/auth/tokenStore";

// POST /api/quiz — generate AI quiz for a space
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { spaceId, model: requestedModel, questionCount = 5 } = body;

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
                { error: "No content in this space to quiz on. Add some content first." },
                { status: 400 }
            );
        }

        const count = Math.min(Math.max(questionCount, 1), 20);

        const messages = [
            {
                role: "system" as const,
                content: `You are a quiz generator for students. Create multiple-choice questions to test understanding.
**ALWAYS write questions and options in English**, regardless of the language of the source material.

Output your response as a JSON array of questions with this exact format:
[{"question": "What is...?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 0}]

Rules:
- Each question MUST have exactly 4 options
- correctIndex is 0-based (0-3)
- Questions should test understanding, not just memorization
- Vary difficulty: mix easy, medium, and hard questions
- IMPORTANT: Return ONLY valid JSON, no markdown code fences, no extra text.`,
            },
            {
                role: "user" as const,
                content: `Generate ${count} quiz questions based on these learning materials:\n\n${contextText}`,
            },
        ];

        const result = await chatCompletion(model, messages);

        // Parse questions
        let questions: { question: string; options: string[]; correctIndex: number }[] = [];
        try {
            let cleaned = result.content.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
            }
            questions = JSON.parse(cleaned);
        } catch {
            return NextResponse.json(
                { error: "AI returned invalid quiz format. Please try again." },
                { status: 500 }
            );
        }

        // Validate
        questions = questions.filter(
            q =>
                q.question &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                typeof q.correctIndex === "number" &&
                q.correctIndex >= 0 &&
                q.correctIndex <= 3
        );

        if (questions.length === 0) {
            return NextResponse.json(
                { error: "AI did not generate valid questions. Please try again." },
                { status: 500 }
            );
        }

        // Delete old quiz for this space
        db.delete(quizQuestions).where(eq(quizQuestions.spaceId, spaceId)).run();

        // Save new questions
        const saved = questions.map(q => {
            const id = generateId();
            db.insert(quizQuestions)
                .values({
                    id,
                    spaceId,
                    question: q.question,
                    options: JSON.stringify(q.options),
                    correctIndex: q.correctIndex,
                })
                .run();
            return db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).get();
        });

        return NextResponse.json({ questions: saved, model: result.model }, { status: 201 });
    } catch (error) {
        console.error("POST /api/quiz error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate quiz" },
            { status: 500 }
        );
    }
}
