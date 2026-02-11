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
        const { spaceId, model: requestedModel, questionCount = 10, quizMode = "qcu" } = body;

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

        const count = Math.min(Math.max(questionCount, 1), 30);

        // Build prompt based on quiz mode
        let modeInstructions: string;
        let formatExample: string;

        if (quizMode === "qcm") {
            modeInstructions = `You are generating a QCM (Questions à Choix Multiples) quiz. 
IMPORTANT RULES FOR QCM:
- Each question can have ONE or MULTIPLE correct answers — YOU decide based on what makes sense for the question.
- NOT every question needs multiple correct answers. Some questions naturally have only 1 correct answer, others have 2, 3, or even 4.
- The "correctIndices" field is an array of 0-based indices of ALL correct options.
- Make the quiz challenging: include distractors that are close to correct but wrong.
- For questions with multiple correct answers, the options should test nuanced understanding.
- Each question MUST have exactly 4 or 5 options.
- Vary the number of correct answers across questions to keep students thinking.`;
            formatExample = `[{"question": "Which of the following are...", "options": ["A", "B", "C", "D"], "correctIndices": [0, 2]}, {"question": "What is...", "options": ["A", "B", "C", "D"], "correctIndices": [1]}]`;
        } else {
            modeInstructions = `You are generating a QCU (Question à Choix Unique) quiz.
IMPORTANT RULES FOR QCU:
- Each question has EXACTLY ONE correct answer.
- The "correctIndices" field is an array with exactly ONE index.
- Each question MUST have exactly 4 options.
- Include plausible distractors that test real understanding.`;
            formatExample = `[{"question": "What is...", "options": ["A", "B", "C", "D"], "correctIndices": [2]}]`;
        }

        const messages = [
            {
                role: "system" as const,
                content: `${modeInstructions}

**ALWAYS write questions and options in the SAME language as the source material.** If the source is in French, write questions in French. If in English, write in English. Match the language of the original content exactly.

Output your response as a JSON array with this exact format:
${formatExample}

Additional rules:
- Questions should test UNDERSTANDING and APPLICATION, not just memorization
- Vary difficulty: include easy (30%), medium (40%), and hard (30%) questions
- Cover different topics from the source material evenly
- Make wrong options plausible — avoid obviously wrong answers
- For complex topics, test relationships between concepts
- IMPORTANT: Return ONLY valid JSON, no markdown code fences, no extra text.`,
            },
            {
                role: "user" as const,
                content: `Generate exactly ${count} ${quizMode === "qcm" ? "QCM (multiple correct answers possible)" : "QCU (single correct answer)"} quiz questions based on these learning materials:\n\n${contextText}`,
            },
        ];

        const result = await chatCompletion(model, messages, { maxTokens: 8192 });

        // Parse questions
        let questions: { question: string; options: string[]; correctIndices: number[]; correctIndex?: number }[] = [];
        try {
            let cleaned = result.content.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
            }
            const parsed = JSON.parse(cleaned);
            // Normalize: support both old format (correctIndex) and new (correctIndices)
            questions = parsed.map((q: any) => {
                let indices: number[] = [];
                if (Array.isArray(q.correctIndices) && q.correctIndices.length > 0) {
                    indices = q.correctIndices;
                } else if (typeof q.correctIndex === "number") {
                    indices = [q.correctIndex];
                }
                return { ...q, correctIndices: indices, correctIndex: indices[0] ?? 0 };
            });
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
                q.options.length >= 4 &&
                q.options.length <= 5 &&
                Array.isArray(q.correctIndices) &&
                q.correctIndices.length > 0 &&
                q.correctIndices.every(i => typeof i === "number" && i >= 0 && i < q.options.length)
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
                    correctIndex: q.correctIndices[0],
                    correctIndices: JSON.stringify(q.correctIndices),
                    quizMode: quizMode,
                })
                .run();
            return db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).get();
        });

        return NextResponse.json({ questions: saved, model: result.model, quizMode }, { status: 201 });
    } catch (error) {
        console.error("POST /api/quiz error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate quiz" },
            { status: 500 }
        );
    }
}
