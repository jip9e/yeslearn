import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { contentItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";

// GET /api/content/:id — get content detail
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getDb();

        const item = db.select().from(contentItems).where(eq(contentItems.id, id)).get();
        if (!item) {
            return NextResponse.json({ error: "Content not found" }, { status: 404 });
        }

        return NextResponse.json({
            ...item,
            metadata: JSON.parse(item.metadata || "{}"),
        });
    } catch (error) {
        console.error("GET /api/content/:id error:", error);
        return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
    }
}

// DELETE /api/content/:id — delete content
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getDb();

        const item = db.select().from(contentItems).where(eq(contentItems.id, id)).get();
        if (!item) {
            return NextResponse.json({ error: "Content not found" }, { status: 404 });
        }

        // Delete file from disk if exists
        if (item.filePath) {
            try {
                fs.unlinkSync(item.filePath);
            } catch {
                // File might already be gone
            }
        }

        db.delete(contentItems).where(eq(contentItems.id, id)).run();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/content/:id error:", error);
        return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
    }
}
