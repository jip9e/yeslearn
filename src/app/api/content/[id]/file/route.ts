import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { contentItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

// GET /api/content/:id/file — serve the uploaded file (PDF, etc.)
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getDb();

        const item = db
            .select()
            .from(contentItems)
            .where(eq(contentItems.id, id))
            .get();

        if (!item) {
            return NextResponse.json(
                { error: "Content not found" },
                { status: 404 }
            );
        }

        if (!item.filePath || !fs.existsSync(item.filePath)) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(item.filePath);
        const ext = path.extname(item.filePath).toLowerCase();

        // Determine content type
        const contentTypeMap: Record<string, string> = {
            ".pdf": "application/pdf",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".mp3": "audio/mpeg",
            ".wav": "audio/wav",
            ".txt": "text/plain",
        };

        const contentType = contentTypeMap[ext] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": "inline",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("GET /api/content/:id/file error:", error);
        return NextResponse.json(
            { error: "Failed to serve file" },
            { status: 500 }
        );
    }
}
