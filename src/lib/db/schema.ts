import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ── Spaces ──────────────────────────────────────────────────
export const spaces = sqliteTable("spaces", {
    id: text("id").primaryKey(), // nanoid
    name: text("name").notNull(),
    description: text("description").default(""),
    icon: text("icon").default("📚"),
    color: text("color").default("bg-blue-400"),
    createdAt: text("created_at")
        .default(sql`(datetime('now'))`)
        .notNull(),
    updatedAt: text("updated_at")
        .default(sql`(datetime('now'))`)
        .notNull(),
});

// ── Content Items ───────────────────────────────────────────
export const contentItems = sqliteTable("content_items", {
    id: text("id").primaryKey(),
    spaceId: text("space_id")
        .notNull()
        .references(() => spaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(), // youtube | pdf | website | audio | text
    sourceUrl: text("source_url"),
    filePath: text("file_path"),
    extractedText: text("extracted_text"),
    metadata: text("metadata"), // JSON string
    createdAt: text("created_at")
        .default(sql`(datetime('now'))`)
        .notNull(),
});

// ── Chat Messages ───────────────────────────────────────────
export const chatMessages = sqliteTable("chat_messages", {
    id: text("id").primaryKey(),
    spaceId: text("space_id")
        .notNull()
        .references(() => spaces.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // user | ai
    content: text("content").notNull(),
    createdAt: text("created_at")
        .default(sql`(datetime('now'))`)
        .notNull(),
});

// ── Summaries ───────────────────────────────────────────────
export const summaries = sqliteTable("summaries", {
    id: text("id").primaryKey(),
    spaceId: text("space_id")
        .notNull()
        .references(() => spaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: text("created_at")
        .default(sql`(datetime('now'))`)
        .notNull(),
});

// ── Quiz Questions ──────────────────────────────────────────
export const quizQuestions = sqliteTable("quiz_questions", {
    id: text("id").primaryKey(),
    spaceId: text("space_id")
        .notNull()
        .references(() => spaces.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    options: text("options").notNull(), // JSON array
    correctIndex: integer("correct_index").notNull(),
    createdAt: text("created_at")
        .default(sql`(datetime('now'))`)
        .notNull(),
});

// ── Settings (key-value) ────────────────────────────────────
export const settings = sqliteTable("settings", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
});
