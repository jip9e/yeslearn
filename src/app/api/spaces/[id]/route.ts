import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { spaces, contentItems, chatMessages, chatSessions, summaries, quizQuestions } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

// GET /api/spaces/:id — get space with content items
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getDb();

        const space = db.select().from(spaces).where(eq(spaces.id, id)).get();
        if (!space) {
            return NextResponse.json({ error: "Space not found" }, { status: 404 });
        }

        const items = db
            .select()
            .from(contentItems)
            .where(eq(contentItems.spaceId, id))
            .orderBy(desc(contentItems.createdAt))
            .all();

        const messages = db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.spaceId, id))
            .orderBy(chatMessages.createdAt)
            .all();

        const sessions = db
            .select()
            .from(chatSessions)
            .where(eq(chatSessions.spaceId, id))
            .orderBy(chatSessions.createdAt)
            .all();

        // Group messages by session
        const sessionsWithMessages = sessions.map((s) => ({
            ...s,
            messages: messages.filter((m) => m.sessionId === s.id),
        }));

        // Include orphan messages (no session) for backward compat
        const orphanMessages = messages.filter((m) => !m.sessionId);

        const spaceSummaries = db
            .select()
            .from(summaries)
            .where(eq(summaries.spaceId, id))
            .orderBy(summaries.createdAt)
            .all();

        const quizzes = db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.spaceId, id))
            .orderBy(quizQuestions.createdAt)
            .all();

        return NextResponse.json({
            ...space,
            contentItems: items,
            chatMessages: orphanMessages,
            chatSessions: sessionsWithMessages,
            summaries: spaceSummaries,
            quizQuestions: quizzes.map((q) => ({
                ...q,
                options: JSON.parse(q.options),
            })),
        });
    } catch (error) {
        console.error("GET /api/spaces/:id error:", error);
        return NextResponse.json({ error: "Failed to fetch space" }, { status: 500 });
    }
}

// PUT /api/spaces/:id — update space
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const db = getDb();

        const space = db.select().from(spaces).where(eq(spaces.id, id)).get();
        if (!space) {
            return NextResponse.json({ error: "Space not found" }, { status: 404 });
        }

        db.update(spaces)
            .set({
                name: body.name ?? space.name,
                description: body.description ?? space.description,
                icon: body.icon ?? space.icon,
                color: body.color ?? space.color,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(spaces.id, id))
            .run();

        const updated = db.select().from(spaces).where(eq(spaces.id, id)).get();
        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/spaces/:id error:", error);
        return NextResponse.json({ error: "Failed to update space" }, { status: 500 });
    }
}

// DELETE /api/spaces/:id — delete space and all content
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getDb();

        const space = db.select().from(spaces).where(eq(spaces.id, id)).get();
        if (!space) {
            return NextResponse.json({ error: "Space not found" }, { status: 404 });
        }

        db.delete(spaces).where(eq(spaces.id, id)).run();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/spaces/:id error:", error);
        return NextResponse.json({ error: "Failed to delete space" }, { status: 500 });
    }
}
