import { getDb, generateId } from './db';

export type LearnStatus = 'new' | 'learning' | 'familiar' | 'mastered';

export interface WordRecord {
  id: string;
  user_id: string;
  word_id: number;
  status: LearnStatus;
  last_review_date: string;
  next_review_date: string | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

// Get all word records for a user
export function getUserWordRecords(userId: string): WordRecord[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM word_records
    WHERE user_id = ?
    ORDER BY word_id
  `);

  return stmt.all(userId) as WordRecord[];
}

// Get word record by user and word ID
export function getWordRecord(userId: string, wordId: number): WordRecord | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM word_records
    WHERE user_id = ? AND word_id = ?
  `);

  const record = stmt.get(userId, wordId) as WordRecord | undefined;
  return record || null;
}

// Create or update word record
export function upsertWordRecord(
  userId: string,
  wordId: number,
  status: LearnStatus,
  nextReviewDate?: string
): WordRecord {
  const db = getDb();
  const existing = getWordRecord(userId, wordId);

  if (existing) {
    // Update existing record
    const stmt = db.prepare(`
      UPDATE word_records
      SET status = ?,
          last_review_date = CURRENT_TIMESTAMP,
          next_review_date = ?,
          review_count = review_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND word_id = ?
    `);

    stmt.run(status, nextReviewDate || null, userId, wordId);
  } else {
    // Create new record
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO word_records (id, user_id, word_id, status, next_review_date)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, wordId, status, nextReviewDate || null);
  }

  const record = getWordRecord(userId, wordId);
  if (!record) {
    throw new Error('Failed to create/update word record');
  }

  return record;
}

// Get words to review today
export function getWordsToReview(userId: string, date: string): WordRecord[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM word_records
    WHERE user_id = ?
      AND next_review_date IS NOT NULL
      AND next_review_date <= ?
    ORDER BY next_review_date
  `);

  return stmt.all(userId, date) as WordRecord[];
}

// Get word records by status
export function getWordRecordsByStatus(userId: string, status: LearnStatus): WordRecord[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM word_records
    WHERE user_id = ? AND status = ?
    ORDER BY updated_at DESC
  `);

  return stmt.all(userId, status) as WordRecord[];
}

// Delete word record
export function deleteWordRecord(userId: string, wordId: number): void {
  const db = getDb();
  const stmt = db.prepare(`
    DELETE FROM word_records
    WHERE user_id = ? AND word_id = ?
  `);

  stmt.run(userId, wordId);
}

// Get statistics
export function getWordRecordStats(userId: string): {
  total: number;
  new: number;
  learning: number;
  familiar: number;
  mastered: number;
} {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
      SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learning,
      SUM(CASE WHEN status = 'familiar' THEN 1 ELSE 0 END) as familiar,
      SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) as mastered
    FROM word_records
    WHERE user_id = ?
  `);

  return stmt.get(userId) as any;
}
