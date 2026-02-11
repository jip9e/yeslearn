import { NextRequest, NextResponse } from "next/server";
import { getDb, getUploadsDir } from "@/lib/db";
import { contentItems, spaces } from "@/lib/db/schema";
import { generateId } from "@/lib/id";
import { eq, sql } from "drizzle-orm";
import path from "path";
import fs from "fs";

// POST /api/content — add content to a space
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const spaceId = formData.get("spaceId") as string;
        const type = formData.get("type") as string;
        const name = formData.get("name") as string;
        const sourceUrl = formData.get("sourceUrl") as string | null;
        const file = formData.get("file") as File | null;

        if (!spaceId || !type || !name) {
            return NextResponse.json(
                { error: "spaceId, type, and name are required" },
                { status: 400 }
            );
        }

        const db = getDb();

        // Verify space exists
        const space = db.select().from(spaces).where(eq(spaces.id, spaceId)).get();
        if (!space) {
            return NextResponse.json({ error: "Space not found" }, { status: 404 });
        }

        const id = generateId();
        let extractedText = "";
        let filePath: string | null = null;
        let metadata: Record<string, unknown> = {};

        // ── YouTube ──────────────────────────────────────
        if (type === "youtube" && sourceUrl) {
            try {
                const { YoutubeTranscript } = await import("youtube-transcript");
                const transcript = await YoutubeTranscript.fetchTranscript(sourceUrl);
                extractedText = transcript.map((t) => t.text).join(" ");
                metadata = {
                    sourceUrl,
                    transcriptSegments: transcript.length,
                    duration: transcript.length > 0
                        ? Math.round(transcript[transcript.length - 1].offset / 1000)
                        : 0,
                };
            } catch (err) {
                console.error("YouTube transcript error:", err);
                extractedText = "";
                metadata = { sourceUrl, error: "Could not fetch transcript" };
            }
        }

        // ── PDF ──────────────────────────────────────────
        if (type === "pdf" && file) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());

                // Save file to uploads
                const uploadsDir = getUploadsDir();
                const fileName = `${id}_${file.name}`;
                filePath = path.join(uploadsDir, fileName);
                fs.writeFileSync(filePath, buffer);

                // Extract text using dynamic import (pdf-parse v2 is ESM)
                const pdfParseModule = await import("pdf-parse");
                const pdfParse = pdfParseModule.default ?? pdfParseModule;
                const pdfData = await pdfParse(buffer, {
                    // Preserve all text: don't skip any pages
                    max: 0,
                    // Custom page renderer to capture every character with structure
                    pagerender: async function (pageData: { getTextContent: (opts: { normalizeWhitespace: boolean; disableCombineTextItems: boolean }) => Promise<{ items: Array<{ str: string; transform: number[]; hasEOL?: boolean }> }> }) {
                        const textContent = await pageData.getTextContent({
                            normalizeWhitespace: false,
                            disableCombineTextItems: false,
                        });
                        // Build text preserving line breaks from the PDF layout
                        let lastY: number | null = null;
                        let text = "";
                        for (const item of textContent.items) {
                            const y = item.transform[5];
                            if (lastY !== null && Math.abs(y - lastY) > 2) {
                                text += "\n";
                            }
                            text += item.str;
                            lastY = y;
                        }
                        return text;
                    },
                });

                // Clean up: collapse 3+ newlines into 2, trim each line
                extractedText = pdfData.text
                    .replace(/\n{3,}/g, "\n\n")
                    .split("\n")
                    .map((l: string) => l.trimEnd())
                    .join("\n")
                    .trim();

                metadata = {
                    pages: pdfData.numpages,
                    fileName: file.name,
                    fileSize: file.size,
                    textLength: extractedText.length,
                };
            } catch (err) {
                console.error("PDF parse error:", err);
                metadata = { fileName: file.name, error: "Could not parse PDF" };
            }
        }

        // ── Website ──────────────────────────────────────
        if (type === "website" && sourceUrl) {
            try {
                const response = await fetch(sourceUrl);
                const html = await response.text();
                // Basic HTML text extraction (strip tags)
                extractedText = html
                    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                    .replace(/<[^>]+>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 50000); // Limit text length
                metadata = { sourceUrl, textLength: extractedText.length };
            } catch (err) {
                console.error("Website fetch error:", err);
                metadata = { sourceUrl, error: "Could not fetch website" };
            }
        }

        // ── Text / Notes ─────────────────────────────────
        if (type === "text") {
            extractedText = (formData.get("text") as string) || "";
            metadata = { textLength: extractedText.length };
        }

        // ── Save to database ─────────────────────────────
        db.insert(contentItems)
            .values({
                id,
                spaceId,
                name: name.trim(),
                type,
                sourceUrl,
                filePath,
                extractedText,
                metadata: JSON.stringify(metadata),
            })
            .run();

        // Update space timestamp
        db.update(spaces)
            .set({ updatedAt: new Date().toISOString() })
            .where(eq(spaces.id, spaceId))
            .run();

        const created = db
            .select()
            .from(contentItems)
            .where(eq(contentItems.id, id))
            .get();

        return NextResponse.json(
            { ...created, metadata: JSON.parse(created?.metadata || "{}") },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/content error:", error);
        return NextResponse.json({ error: "Failed to add content" }, { status: 500 });
    }
}
