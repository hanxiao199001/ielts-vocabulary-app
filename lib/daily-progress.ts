import { getDb, generateId } from './db';

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  words_learned: number;
  words_reviewed: number;
  quiz_passed: number;
  study_time: number;
  current_word_index: number;
  created_at: string;
  updated_at: string;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Get or create today's progress record
export function getTodayProgress(userId: string): DailyProgress {
  const db = getDb();
  const today = getTodayDate();

  const stmt = db.prepare(`
    SELECT * FROM daily_progress
    WHERE user_id = ? AND date = ?
  `);

  let progress = stmt.get(userId, today) as DailyProgress | undefined;

  if (!progress) {
    // Create new progress record for today
    const id = generateId();
    const insertStmt = db.prepare(`
      INSERT INTO daily_progress (id, user_id, date)
      VALUES (?, ?, ?)
    `);

    insertStmt.run(id, userId, today);
    progress = stmt.get(userId, today) as DailyProgress;
  }

  return progress!;
}

// Update current word index
export function updateCurrentWordIndex(userId: string, index: number): void {
  const db = getDb();
  const today = getTodayDate();

  // Ensure progress record exists
  getTodayProgress(userId);

  const stmt = db.prepare(`
    UPDATE daily_progress
    SET current_word_index = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND date = ?
  `);

  stmt.run(index, userId, today);
}

// Get current word index
export function getCurrentWordIndex(userId: string): number {
  const progress = getTodayProgress(userId);
  return progress.current_word_index || 0;
}

// Update daily statistics
export function updateDailyStats(
  userId: string,
  stats: {
    words_learned?: number;
    words_reviewed?: number;
    quiz_passed?: number;
    study_time?: number;
  }
): void {
  const db = getDb();
  const today = getTodayDate();

  // Ensure progress record exists
  getTodayProgress(userId);

  const updates: string[] = [];
  const values: any[] = [];

  if (stats.words_learned !== undefined) {
    updates.push('words_learned = words_learned + ?');
    values.push(stats.words_learned);
  }

  if (stats.words_reviewed !== undefined) {
    updates.push('words_reviewed = words_reviewed + ?');
    values.push(stats.words_reviewed);
  }

  if (stats.quiz_passed !== undefined) {
    updates.push('quiz_passed = quiz_passed + ?');
    values.push(stats.quiz_passed);
  }

  if (stats.study_time !== undefined) {
    updates.push('study_time = study_time + ?');
    values.push(stats.study_time);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(userId, today);

  const stmt = db.prepare(`
    UPDATE daily_progress
    SET ${updates.join(', ')}
    WHERE user_id = ? AND date = ?
  `);

  stmt.run(...values);
}

// Get progress for a specific date
export function getProgressByDate(userId: string, date: string): DailyProgress | null {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT * FROM daily_progress
    WHERE user_id = ? AND date = ?
  `);

  const progress = stmt.get(userId, date) as DailyProgress | undefined;
  return progress || null;
}

// Get progress for last N days
export function getRecentProgress(userId: string, days: number = 7): DailyProgress[] {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT * FROM daily_progress
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT ?
  `);

  return stmt.all(userId, days) as DailyProgress[];
}
