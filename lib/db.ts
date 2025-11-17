import Database from 'better-sqlite3';
import { join } from 'path';

// Database file path
const dbPath = join(process.cwd(), 'data', 'app.db');

// Initialize database connection
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeDatabase();
  }
  return db;
}

// Initialize database tables
function initializeDatabase() {
  if (!db) return;

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Word records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS word_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      word_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      last_review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      next_review_date DATETIME,
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, word_id)
    );
  `);

  // Daily progress table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      words_learned INTEGER DEFAULT 0,
      words_reviewed INTEGER DEFAULT 0,
      quiz_passed INTEGER DEFAULT 0,
      study_time INTEGER DEFAULT 0,
      current_word_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );
  `);

  // Add current_word_index column if it doesn't exist (migration)
  try {
    db.exec(`
      ALTER TABLE daily_progress ADD COLUMN current_word_index INTEGER DEFAULT 0;
    `);
  } catch (e) {
    // Column already exists, ignore error
  }

  // User settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      voice_accent TEXT DEFAULT 'US',
      speech_rate REAL DEFAULT 1.0,
      daily_goal INTEGER DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_word_records_user_status
    ON word_records(user_id, status);

    CREATE INDEX IF NOT EXISTS idx_word_records_user_next_review
    ON word_records(user_id, next_review_date);

    CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date
    ON daily_progress(user_id, date);
  `);
}

// Helper function to generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Close database connection
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
