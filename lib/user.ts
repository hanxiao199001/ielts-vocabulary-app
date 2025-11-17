import { getDb, generateId } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

// Create a new user
export async function createUser(email: string, password: string, name?: string): Promise<UserWithoutPassword> {
  const db = getDb();
  const id = generateId();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, email, hashedPassword, name || null);

    // Create default settings for the user
    const settingsStmt = db.prepare(`
      INSERT INTO user_settings (id, user_id)
      VALUES (?, ?)
    `);
    settingsStmt.run(generateId(), id);

    const user = getUserById(id);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

// Get user by ID
export function getUserById(id: string): UserWithoutPassword | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, email, name, created_at, updated_at
    FROM users
    WHERE id = ?
  `);

  const user = stmt.get(id) as UserWithoutPassword | undefined;
  return user || null;
}

// Get user by email
export function getUserByEmail(email: string): User | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT *
    FROM users
    WHERE email = ?
  `);

  const user = stmt.get(email) as User | undefined;
  return user || null;
}

// Verify user password
export async function verifyPassword(email: string, password: string): Promise<UserWithoutPassword | null> {
  const user = getUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Update user
export function updateUser(id: string, data: Partial<Pick<User, 'name' | 'email'>>): UserWithoutPassword | null {
  const db = getDb();

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }

  if (data.email !== undefined) {
    updates.push('email = ?');
    values.push(data.email);
  }

  if (updates.length === 0) {
    return getUserById(id);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = ?
  `);

  stmt.run(...values);
  return getUserById(id);
}
