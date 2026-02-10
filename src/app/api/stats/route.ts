import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { spaces, contentItems } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";

// GET /api/stats — dashboard statistics
export async function GET() {
    try {
        const db = getDb();

        const spaceCount = db
            .select({ count: sql<number>`COUNT(*)` })
            .from(spaces)
            .get();

        const itemCount = db
            .select({ count: sql<number>`COUNT(*)` })
            .from(contentItems)
            .get();

        // Recent activity — last 10 content items with space info
        const recentActivity = db
            .select({
                id: contentItems.id,
                name: contentItems.name,
                type: contentItems.type,
                createdAt: contentItems.createdAt,
                spaceId: contentItems.spaceId,
                spaceName: spaces.name,
            })
            .from(contentItems)
            .leftJoin(spaces, sql`${contentItems.spaceId} = ${spaces.id}`)
            .orderBy(desc(contentItems.createdAt))
            .limit(10)
            .all();

        return NextResponse.json({
            spaceCount: spaceCount?.count || 0,
            itemCount: itemCount?.count || 0,
            quizCount: 0, // Will be computed once AI quiz generation is added
            recentActivity,
        });
    } catch (error) {
        console.error("GET /api/stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
