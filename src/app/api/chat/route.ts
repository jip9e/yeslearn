import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { chatMessages, contentItems, settings } from "@/lib/db/schema";
import { generateId } from "@/lib/id";
import { eq } from "drizzle-orm";
import { chatCompletion } from "@/lib/ai/aiClient";
import { getDefaultProfile } from "@/lib/auth/tokenStore";

// POST /api/chat — send message & get AI response
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { spaceId, role, content, model: requestedModel } = body;

        if (!spaceId || !role || !content) {
            return NextResponse.json(
                { error: "spaceId, role, and content are required" },
                { status: 400 }
            );
        }

        const db = getDb();

        // Save user message
        const userMsgId = generateId();
        db.insert(chatMessages)
            .values({ id: userMsgId, spaceId, role, content })
            .run();

        const savedUser = db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.id, userMsgId))
            .get();

        // If it's an AI message being saved (from legacy path), just return
        if (role === "ai") {
            return NextResponse.json(savedUser, { status: 201 });
        }

        // ── Generate real AI response ────────────────────────────

        // Check if any provider is connected
        const copilotConnected = !!getDefaultProfile("github-copilot");
        const geminiConnected = !!getDefaultProfile("google-gemini-cli");

        if (!copilotConnected && !geminiConnected) {
            // Save a helpful message
            const noProviderMsg = "I'd love to help! Please connect an AI provider in **Settings → AI Providers** to enable intelligent responses. Your message has been saved and I'll have full context when AI is enabled.";
            const aiId = generateId();
            db.insert(chatMessages)
                .values({ id: aiId, spaceId, role: "ai", content: noProviderMsg })
                .run();
            const savedAi = db.select().from(chatMessages).where(eq(chatMessages.id, aiId)).get();
            return NextResponse.json({ userMessage: savedUser, aiMessage: savedAi }, { status: 201 });
        }

        // Determine model
        let model = requestedModel;
        if (!model) {
            const setting = db.select().from(settings).where(eq(settings.key, "default-model")).get();
            model = setting?.value || (copilotConnected ? "gpt-4o" : "gemini-2.5-flash");
        }

        // Gather space content for context
        const spaceContent = db
            .select({ name: contentItems.name, text: contentItems.extractedText })
            .from(contentItems)
            .where(eq(contentItems.spaceId, spaceId))
            .all();

        const contextText = spaceContent
            .filter(c => c.text)
            .map(c => `--- ${c.name} ---\n${c.text!.slice(0, 8000)}`)
            .join("\n\n");

        // Get recent chat history (last 20 messages)
        const history = db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.spaceId, spaceId))
            .all()
            .slice(-20);

        // Build source map for citations
        const sourceMap = spaceContent
            .filter(c => c.text)
            .map((c, i) => ({ index: i + 1, name: c.name }));

        const sourceRefInstructions = sourceMap.length > 0
            ? `\n\n## Source Citation Rules
When your answer draws from the learning materials, cite sources inline using this exact format: [Source N] where N is the source number.
Available sources:
${sourceMap.map(s => `- [Source ${s.index}]: ${s.name}`).join("\n")}

Example: "Photosynthesis converts light energy into chemical energy [Source 1]."

## Follow-up Questions
At the VERY END of your response, add a section like this (always exactly 3 questions):
---follow-up---
What are the key differences between X and Y?
Can you explain how Z works in more detail?
What are real-world applications of this concept?
---end-follow-up---`
            : `\n\n## Follow-up Questions
At the VERY END of your response, add a section like this (always exactly 3 questions):
---follow-up---
What topics should I start learning about?
How can I make the most of this study tool?
What types of content work best for learning?
---end-follow-up---`;

        const systemPrompt = contextText
            ? `You are YesLearn AI, a premium AI study tutor. You help students deeply understand their learning materials.

## Response Guidelines
- Use **markdown formatting** extensively: headers (##, ###), **bold** for key terms, bullet points for lists
- Structure long answers with clear sections using ## headers
- Use simple analogies and real-world examples to explain complex concepts
- When explaining processes, use numbered step-by-step lists
- Highlight important definitions with **bold**
- Keep paragraphs short (2-3 sentences max) for readability
- Be warm, encouraging, and educational in tone
- If relevant, suggest related topics the student might want to explore
${sourceRefInstructions}

Here is the student's learning material for context:

${contextText}`
            : `You are YesLearn AI, a premium AI study tutor. The student hasn't uploaded any materials yet.

## Response Guidelines
- Use **markdown formatting**: headers, **bold**, bullet points, numbered lists
- Be warm, encouraging, and helpful
- Help with general questions and encourage them to add content (PDFs, YouTube videos, websites) to their space for personalized learning
${sourceRefInstructions}`;

        const aiMessages = [
            { role: "system" as const, content: systemPrompt },
            ...history
                .filter(m => m.id !== userMsgId) // exclude current msg, we add it below
                .map(m => ({
                    role: (m.role === "ai" ? "assistant" : "user") as "system" | "user" | "assistant",
                    content: m.content,
                })),
            { role: "user" as const, content },
        ];

        const result = await chatCompletion(model, aiMessages);

        // Parse follow-up questions and clean content
        let aiContent = result.content;
        let followUpQuestions: string[] = [];
        const followUpMatch = aiContent.match(/---follow-up---([\s\S]*?)---end-follow-up---/);
        if (followUpMatch) {
            followUpQuestions = followUpMatch[1]
                .split("\n")
                .map(q => q.trim())
                .filter(q => q.length > 0);
            aiContent = aiContent.replace(/---follow-up---[\s\S]*?---end-follow-up---/, "").trim();
        }

        // Extract source references used in the response
        const sourceRefs: { index: number; name: string }[] = [];
        const sourcePattern = /\[Source (\d+)\]/g;
        let match;
        while ((match = sourcePattern.exec(aiContent)) !== null) {
            const idx = parseInt(match[1]);
            const src = sourceMap.find(s => s.index === idx);
            if (src && !sourceRefs.find(s => s.index === idx)) {
                sourceRefs.push(src);
            }
        }

        // Save AI response (clean version without follow-up markers)
        const aiId = generateId();
        db.insert(chatMessages)
            .values({ id: aiId, spaceId, role: "ai", content: aiContent })
            .run();
        const savedAi = db.select().from(chatMessages).where(eq(chatMessages.id, aiId)).get();

        return NextResponse.json(
            { 
                userMessage: savedUser, 
                aiMessage: savedAi, 
                model: result.model,
                sources: sourceRefs,
                followUpQuestions,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/chat error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to process message" },
            { status: 500 }
        );
    }
}
