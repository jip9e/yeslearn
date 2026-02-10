import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/settings?key=xxx — read a setting
export async function GET(req: NextRequest) {
    try {
        const key = req.nextUrl.searchParams.get("key");
        if (!key) {
            return NextResponse.json({ error: "key is required" }, { status: 400 });
        }

        const db = getDb();
        const row = db.select().from(settings).where(eq(settings.key, key)).get();

        return NextResponse.json({ key, value: row?.value ?? null });
    } catch (error) {
        console.error("GET /api/settings error:", error);
        return NextResponse.json({ error: "Failed to read setting" }, { status: 500 });
    }
}

// PUT /api/settings — upsert a setting
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: "key and value are required" }, { status: 400 });
        }

        const db = getDb();

        // SQLite upsert via insert-or-replace
        db.insert(settings)
            .values({ key, value: String(value) })
            .onConflictDoUpdate({ target: settings.key, set: { value: String(value) } })
            .run();

        return NextResponse.json({ key, value: String(value) });
    } catch (error) {
        console.error("PUT /api/settings error:", error);
        return NextResponse.json({ error: "Failed to save setting" }, { status: 500 });
    }
}
