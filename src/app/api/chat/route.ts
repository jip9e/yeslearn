import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { chatMessages, chatSessions, contentItems, settings } from "@/lib/db/schema";
import { generateId } from "@/lib/id";
import { eq } from "drizzle-orm";
import { chatCompletion } from "@/lib/ai/aiClient";
import { getDefaultProfile } from "@/lib/auth/tokenStore";

// POST /api/chat — send message & get AI response
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { spaceId, role, content, model: requestedModel, sessionId, sessionName } = body;

        if (!spaceId || !role || !content) {
            return NextResponse.json(
                { error: "spaceId, role, and content are required" },
                { status: 400 }
            );
        }

        const db = getDb();

        // Ensure session exists (create if new)
        let resolvedSessionId = sessionId || null;
        if (resolvedSessionId) {
            const existing = db.select().from(chatSessions).where(eq(chatSessions.id, resolvedSessionId)).get();
            if (!existing) {
                db.insert(chatSessions)
                    .values({ id: resolvedSessionId, spaceId, name: sessionName || "New Chat" })
                    .run();
            }
        }

        // Save user message
        const userMsgId = generateId();
        db.insert(chatMessages)
            .values({ id: userMsgId, spaceId, sessionId: resolvedSessionId, role, content })
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
                .values({ id: aiId, spaceId, sessionId: resolvedSessionId, role: "ai", content: noProviderMsg })
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
            .map(c => `--- ${c.name} ---\n${c.text!.slice(0, 15000)}`)
            .join("\n\n");

        // Get recent chat history (last 20 messages from current session, or all if no session)
        const allMsgs = db
            .select()
            .from(chatMessages)
            .where(resolvedSessionId ? eq(chatMessages.sessionId, resolvedSessionId) : eq(chatMessages.spaceId, spaceId))
            .all();
        const history = allMsgs.slice(-20);

        // Build source map for citations
        const sourceMap = spaceContent
            .filter(c => c.text)
            .map((c, i) => ({ index: i + 1, name: c.name }));

        const sourceRefInstructions = sourceMap.length > 0
            ? `\n\n## CRITICAL: Source Citations (MANDATORY)
You MUST cite sources for EVERY factual claim. Use this exact format inline: [Source 1], [Source 2], etc.
Do NOT skip citations. Every paragraph that references the material MUST have at least one [Source N] tag.

Available sources:
${sourceMap.map(s => `[Source ${s.index}] = "${s.name}"`).join("\n")}

Example output: "The mitochondria is the powerhouse of the cell [Source 1]. This process involves ATP synthesis [Source 1] and electron transport chains [Source 2]."

## CRITICAL: Follow-up Questions (MANDATORY)
You MUST end EVERY response with EXACTLY 3 follow-up questions that are specific to what was just discussed. They should help the student go deeper into the topic.
Format them as the VERY LAST thing in your response, like this:

---follow-up---
First specific follow-up question here?
Second specific follow-up question here?
Third specific follow-up question here?
---end-follow-up---

The questions must be specific to the content discussed, NOT generic. They should reference actual concepts, terms, or topics from the conversation.`
            : `\n\n## CRITICAL: Follow-up Questions (MANDATORY)
You MUST end EVERY response with EXACTLY 3 follow-up questions.
Format them as the VERY LAST thing in your response, like this:

---follow-up---
First follow-up question here?
Second follow-up question here?
Third follow-up question here?
---end-follow-up---`;

        // Detect language from context or user message
        const detectLanguageInstruction = `CRITICAL LANGUAGE RULE: You MUST detect the language of the source material and any quoted text (text after ">"). ALWAYS respond in the SAME language as the quoted text or source material. If the quoted text is in French, respond entirely in French. If the source material is in French and the student quotes French text, respond in French — even if the student's instruction is in English. The language of the quoted content and source material ALWAYS takes priority over the language of the instruction.`;

        const systemPrompt = contextText
            ? `You are YesLearn AI, a premium AI study tutor. You help students deeply understand their learning materials.

## Response Guidelines
- ${detectLanguageInstruction}
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
- ${detectLanguageInstruction}
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

        // Try multiple patterns - AI models often vary the exact marker format
        const followUpPatterns = [
            /---\s*follow[- ]?up\s*---([\s\S]*?)---\s*end[- ]?follow[- ]?up\s*---/i,
            /\*\*?follow[- ]?up\*\*?[:\s]*([\s\S]*?)(?:---\s*end|$)/i,
            /#{1,3}\s*(?:suggested\s+)?follow[- ]?up[s]?[:\s]*\n([\s\S]*?)$/i,
            /(?:follow[- ]?up|suggested)\s*questions?[:\s]*\n([\s\S]*?)$/i,
        ];

        for (const pattern of followUpPatterns) {
            const followUpMatch = aiContent.match(pattern);
            if (followUpMatch) {
                const rawQuestions = followUpMatch[1]
                    .split("\n")
                    .map(q => q.replace(/^\s*[-*\d.]+\s*/, "").trim())
                    .filter(q => q.length > 10 && q.endsWith("?"));
                if (rawQuestions.length >= 2) {
                    followUpQuestions = rawQuestions.slice(0, 4);
                    aiContent = aiContent.replace(followUpMatch[0], "").trim();
                    break;
                }
            }
        }

        // Final cleanup: remove any remaining follow-up markers
        aiContent = aiContent.replace(/---\s*follow[- ]?up\s*---/gi, "").replace(/---\s*end[- ]?follow[- ]?up\s*---/gi, "").trim();

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
            .values({ id: aiId, spaceId, sessionId: resolvedSessionId, role: "ai", content: aiContent })
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
