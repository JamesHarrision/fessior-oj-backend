import { AppError } from '@ocj/errors';
import * as authRepo from '../repositories/auth.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../validators/auth.validator';

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export const register = async (data: RegisterInput) => {
  const existingEmail = await authRepo.findUserByEmail(data.email);
  if (existingEmail) {
    throw new AppError('Email already in use', 400);
  }

  const existingUsername = await authRepo.findUserByUsername(data.username);
  if (existingUsername) {
    throw new AppError('Username already taken', 400);
  }

  const passwordHash = await hashPassword(data.password);
  
  const user = await authRepo.createUser({
    username: data.username,
    email: data.email,
    password_hash: passwordHash,
  });

  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const login = async (data: LoginInput) => {
  const user = await authRepo.findUserByEmail(data.email);
  if (!user || !user.password_hash) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(data.password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await authRepo.saveRefreshToken(user.id, refreshToken, expiresAt);

  const { password_hash, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

export const logout = async (refreshToken: string) => {
  if (!refreshToken) return;
  try {
    await authRepo.deleteRefreshToken(refreshToken);
  } catch (error) {
    // Ignore errors if token doesn't exist
  }
};

export const refresh = async (token: string) => {
  if (!token) {
    throw new AppError('Refresh token is required', 400);
  }

  const storedToken = await authRepo.findRefreshToken(token);
  if (!storedToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (storedToken.expires_at < new Date()) {
    await authRepo.deleteRefreshToken(token);
    throw new AppError('Refresh token expired', 401);
  }

  try {
    const decoded = verifyRefreshToken(token);
    const payload = { userId: decoded.userId, role: decoded.role };
    
    const newAccessToken = generateAccessToken(payload);
    return { accessToken: newAccessToken };
  } catch (error) {
    await authRepo.deleteRefreshToken(token);
    throw new AppError('Invalid refresh token', 401);
  }
};

export const getMe = async (userId: string) => {
  const user = await authRepo.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await authRepo.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user || !user.password_hash) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(oldPassword, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const newPasswordHash = await hashPassword(newPassword);
  await authRepo.updateUserPassword(userId, newPasswordHash);

  // TODO: Sẽ thêm sau khi code Revoke All Sessions

  return { message: 'Password changed successfully' };
};

export const revokeSession = async (userId: string, sessionId: string) => {
  const token = await authRepo.findRefreshTokenById(sessionId);
  
  if (!token) {
    throw new AppError('Session not found', 404);
  }
  
  if (token.user_id !== userId) {
    throw new AppError('You are not authorized to revoke this session', 403);
  }
  
  await authRepo.revokeRefreshTokenById(sessionId);
  
  return { message: 'Session revoked successfully' };
};
