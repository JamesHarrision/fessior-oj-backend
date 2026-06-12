import * as userRepo from '../repositories/user.repository';
import { AppError } from '@ocj/errors';

export const getMe = async (userId: string) => {
  const user = await userRepo.findUserById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return user;
};

export const updateMe = async (userId: string, data: { full_name?: string; bio?: string }) => {
  const user = await userRepo.updateUserById(userId, data);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return user;
};

export const getUserByUsername = async (username: string) => {
  const user = await userRepo.findUserByUsername(username);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return user;
};