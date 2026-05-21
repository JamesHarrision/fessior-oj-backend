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
  // 1. Lấy user từ database
  const user = await authRepo.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user || !user.password_hash) {
    throw new AppError('Invalid email or password', 401);
  }

  // 2. Kiểm tra mật khẩu cũ có đúng không
  const isPasswordValid = await comparePassword(oldPassword, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // 3. Hash mật khẩu mới
  const newPasswordHash = await hashPassword(newPassword);

  // 4. Cập nhật mật khẩu mới vào database
  await authRepo.updateUserPassword(userId, newPasswordHash);

  // 5. (Khuyến nghị) Revoke tất cả refresh token cũ trừ token hiện tại
  // TODO: Sẽ thêm sau khi code Revoke All Sessions

  return { message: 'Password changed successfully' };
};
