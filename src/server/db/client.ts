import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.ts';

export interface PressDbHandle {
  sqlite: Database.Database;
  db: BetterSQLite3Database<typeof schema>;
  close: () => void;
}

export function openPressDatabase(dbPath = process.env.DATABASE_PATH || './data/living-edition.sqlite'): PressDbHandle {
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 5000');

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS reader_states (
      reader_id TEXT PRIMARY KEY NOT NULL,
      print_mode TEXT NOT NULL DEFAULT 'graphite',
      grid_overlay INTEGER NOT NULL DEFAULT 0,
      articles_read INTEGER NOT NULL DEFAULT 0,
      flexi_plays INTEGER NOT NULL DEFAULT 0,
      bingo_submissions INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_projects (
      reader_id TEXT NOT NULL,
      reader_service_no INTEGER NOT NULL,
      issue_number TEXT NOT NULL DEFAULT '02',
      created_at INTEGER NOT NULL,
      PRIMARY KEY (reader_id, reader_service_no)
    );

    CREATE INDEX IF NOT EXISTS idx_saved_projects_service_no
      ON saved_projects (reader_service_no);

    CREATE TABLE IF NOT EXISTS margin_dispatches (
      id TEXT PRIMARY KEY NOT NULL,
      reader_id TEXT NOT NULL,
      issue_number TEXT NOT NULL DEFAULT '02',
      article_slug TEXT,
      text TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_margin_dispatches_created_at
      ON margin_dispatches (created_at DESC);

    CREATE TABLE IF NOT EXISTS editorial_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audio_editions (
      cache_key TEXT PRIMARY KEY NOT NULL,
      issue_number TEXT NOT NULL,
      article_slug TEXT NOT NULL,
      voice TEXT NOT NULL,
      model TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      script_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  const db = drizzle(sqlite, { schema });

  return {
    sqlite,
    db,
    close: () => sqlite.close()
  };
}
