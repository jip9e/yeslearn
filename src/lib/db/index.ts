import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// ── Resolve data directory ───────────────────────────────────
function getDataDir(): string {
    const appData =
        process.env.APPDATA ||
        process.env.LOCALAPPDATA ||
        path.join(process.env.HOME || process.env.USERPROFILE || ".", "AppData", "Roaming");
    const dir = path.join(appData, ".YesLearn");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

function getUploadsDir(): string {
    const dir = path.join(getDataDir(), "uploads");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

export { getDataDir, getUploadsDir };

// ── Database singleton ───────────────────────────────────────
let _db: ReturnType<typeof drizzle> | null = null;
let _sqlite: Database.Database | null = null;

export function getDb() {
    if (!_db) {
        const dbPath = path.join(getDataDir(), "yeslearn.db");
        _sqlite = new Database(dbPath);

        // Enable WAL mode for better concurrent read perf
        _sqlite.pragma("journal_mode = WAL");
        _sqlite.pragma("foreign_keys = ON");

        _db = drizzle(_sqlite, { schema });

        // Run table creation on first connect
        initTables(_sqlite);
    }
    return _db;
}

// ── Table initialization (runs once) ─────────────────────────
function initTables(sqlite: Database.Database) {
    sqlite.exec(`
    CREATE TABLE IF NOT EXISTS spaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '📚',
      color TEXT DEFAULT 'bg-blue-400',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY,
      space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      source_url TEXT,
      file_path TEXT,
      extracted_text TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS summaries (
      id TEXT PRIMARY KEY,
      space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_index INTEGER NOT NULL,
      correct_indices TEXT,
      quiz_mode TEXT DEFAULT 'qcu',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

    // ── Migrations for existing databases ──────────────────
    const addColumnIfMissing = (table: string, column: string, type: string, def?: string) => {
        try {
            const cols = sqlite.pragma(`table_info(${table})`) as { name: string }[];
            if (!cols.find(c => c.name === column)) {
                sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}${def ? ` DEFAULT ${def}` : ""}`);
            }
        } catch { /* table may not exist yet */ }
    };
    addColumnIfMissing("quiz_questions", "correct_indices", "TEXT");
    addColumnIfMissing("quiz_questions", "quiz_mode", "TEXT", "'qcu'");
}
