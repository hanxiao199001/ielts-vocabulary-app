import { getDb, generateId } from './db';

export interface UserSettings {
  id: string;
  user_id: string;
  voice_accent: string;
  speech_rate: number;
  daily_goal: number;
  created_at: string;
  updated_at: string;
}

// Get user settings
export function getUserSettingsFromDb(userId: string): UserSettings | null {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT * FROM user_settings
    WHERE user_id = ?
  `);

  const settings = stmt.get(userId) as UserSettings | undefined;
  return settings || null;
}

// Create default settings for new user (called during registration)
export function createDefaultSettings(userId: string): UserSettings {
  const db = getDb();
  const id = generateId();

  const stmt = db.prepare(`
    INSERT INTO user_settings (id, user_id, voice_accent, speech_rate, daily_goal)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, userId, 'US', 1.0, 50);

  const settings = getUserSettingsFromDb(userId);
  if (!settings) {
    throw new Error('Failed to create default settings');
  }

  return settings;
}

// Update user settings
export function updateUserSettings(
  userId: string,
  updates: {
    voice_accent?: string;
    speech_rate?: number;
    daily_goal?: number;
  }
): UserSettings {
  const db = getDb();

  // Ensure settings exist
  let settings = getUserSettingsFromDb(userId);
  if (!settings) {
    settings = createDefaultSettings(userId);
  }

  const updateFields: string[] = [];
  const values: any[] = [];

  if (updates.voice_accent !== undefined) {
    updateFields.push('voice_accent = ?');
    values.push(updates.voice_accent);
  }

  if (updates.speech_rate !== undefined) {
    updateFields.push('speech_rate = ?');
    values.push(updates.speech_rate);
  }

  if (updates.daily_goal !== undefined) {
    updateFields.push('daily_goal = ?');
    values.push(updates.daily_goal);
  }

  if (updateFields.length === 0) {
    return settings;
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(userId);

  const stmt = db.prepare(`
    UPDATE user_settings
    SET ${updateFields.join(', ')}
    WHERE user_id = ?
  `);

  stmt.run(...values);

  const updatedSettings = getUserSettingsFromDb(userId);
  if (!updatedSettings) {
    throw new Error('Failed to update settings');
  }

  return updatedSettings;
}
