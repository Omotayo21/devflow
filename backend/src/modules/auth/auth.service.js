import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../db/index.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { emailQueue } from '../../config/queue.js';

export async function registerUser({ name, email, password }) {
  // Check if email already exists
  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existing.rows.length > 0) {
    throw new AppError('Email already in use', 400);
  }

  // Hash password — never store plain text
  // 12 is the salt rounds — higher = more secure but slower
  const hashedPassword = await bcrypt.hash(password, 12);

  // Save user to DB
  const result = await db.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, hashedPassword]
  );

  await emailQueue.add('welcome', {
    type: 'welcome',
    data: { name, email },
  });

  return result.rows[0];
}

export async function loginUser({ email, password }) {
  // Find user by email
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  const user = result.rows[0];

  // Same error for wrong email or wrong password
  // Never tell attackers which one was wrong
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate access token — short lived, lives in memory on client
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // Generate refresh token — long lived, stored in DB and httpOnly cookie
  const refreshToken = jwt.sign(
    { userId: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  // Save refresh token to DB so we can revoke it on logout
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, refreshToken, expiresAt]
  );

  const { password: _, ...userWithoutPassword } = user;
  return { accessToken, refreshToken, user: userWithoutPassword };
}

export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) throw new AppError('No refresh token', 401);

  // Verify the token is valid and not tampered with
  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  // Check it exists in DB — if user logged out it won't be here
  const result = await db.query(
    `SELECT * FROM refresh_tokens 
     WHERE token = $1 AND user_id = $2 AND expires_at > NOW()`,
    [refreshToken, payload.userId]
  );
  if (result.rows.length === 0) {
    throw new AppError('Refresh token revoked or expired', 401);
  }

  // Issue new access token
  const accessToken = jwt.sign(
    { userId: payload.userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  return { accessToken };
}

export async function logoutUser(refreshToken, userId) {
  // Delete this specific refresh token from DB
  await db.query(
    'DELETE FROM refresh_tokens WHERE token = $1 AND user_id = $2',
    [refreshToken, userId]
  );
}