import crypto from 'crypto';
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

export async function forgotPassword(email) {
  // Find user by email
  const result = await db.query(
    'SELECT id, name FROM users WHERE email = $1',
    [email]
  );
  const user = result.rows[0];

  // If no user found, return success anyway (security best practice)
  if (!user) {
    return { message: 'If that email exists a reset link has been sent' };
  }

  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  // Delete any existing unused tokens for this user
  await db.query(
    'DELETE FROM password_reset_tokens WHERE user_id = $1 AND used = false',
    [user.id]
  );

  // Store token
  await db.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, token, expiresAt]
  );

  // Queue email job
  await emailQueue.add('password.reset', {
    type: 'password.reset',
    data: { 
      name: user.name, 
      email, 
      resetToken: token 
    },
  });

  return { message: 'If that email exists a reset link has been sent' };
}

export async function resetPassword(token, newPassword) {
  // Find valid token
  const result = await db.query(
    `SELECT * FROM password_reset_tokens 
     WHERE token = $1 AND used = false AND expires_at > NOW()`,
    [token]
  );
  const tokenRecord = result.rows[0];

  if (!tokenRecord) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update user password
  await db.query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
    [hashedPassword, tokenRecord.user_id]
  );

  // Mark token as used
  await db.query(
    'UPDATE password_reset_tokens SET used = true WHERE id = $1',
    [tokenRecord.id]
  );

  // Revoke ALL refresh tokens for this user
  await db.query(
    'DELETE FROM refresh_tokens WHERE user_id = $1',
    [tokenRecord.user_id]
  );

  return { message: 'Password reset successfully' };
}

export async function updateProfile(userId, { name, avatarUrl }) {
  const result = await db.query(
    `UPDATE users 
     SET name = COALESCE($1, name),
         avatar_url = COALESCE($2, avatar_url),
         updated_at = NOW() 
     WHERE id = $3 
     RETURNING id, name, email, avatar_url, created_at`,
    [name, avatarUrl, userId]
  );
  const updatedUser = result.rows[0];

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  // If you had redis caching for users, you'd invalidate it here:
  // await invalidate(`user:${userId}`);

  return updatedUser;
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  // Fetch user
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update
  await db.query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
    [hashedPassword, userId]
  );

  return { message: 'Password changed successfully' };
}