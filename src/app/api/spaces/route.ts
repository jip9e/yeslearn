import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { spaces, contentItems } from "@/lib/db/schema";
import { generateId } from "@/lib/id";
import { desc, sql } from "drizzle-orm";

// GET /api/spaces — list all spaces with item counts
export async function GET() {
    try {
        const db = getDb();

        const allSpaces = db
            .select({
                id: spaces.id,
                name: spaces.name,
                description: spaces.description,
                icon: spaces.icon,
                color: spaces.color,
                createdAt: spaces.createdAt,
                updatedAt: spaces.updatedAt,
                itemCount: sql<number>`(SELECT COUNT(*) FROM content_items WHERE space_id = ${spaces.id})`,
            })
            .from(spaces)
            .orderBy(desc(spaces.updatedAt))
            .all();

        return NextResponse.json(allSpaces);
    } catch (error) {
        console.error("GET /api/spaces error:", error);
        return NextResponse.json({ error: "Failed to fetch spaces" }, { status: 500 });
    }
}

// POST /api/spaces — create a new space
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, description, icon, color } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const db = getDb();
        const id = generateId();

        db.insert(spaces)
            .values({
                id,
                name: name.trim(),
                description: description?.trim() || "",
                icon: icon || "📚",
                color: color || "bg-blue-400",
            })
            .run();

        const created = db
            .select()
            .from(spaces)
            .where(sql`${spaces.id} = ${id}`)
            .get();

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error("POST /api/spaces error:", error);
        return NextResponse.json({ error: "Failed to create space" }, { status: 500 });
    }
}
