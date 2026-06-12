import * as userRepo from '../repositories/user.repository';
import { AppError } from '@ocj/errors';
import { deleteAvatar, uploadAvatar } from './cloudinary.service';
import { Submission } from '../models/submission.model';

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

export const uploadUserAvatar = async (userId: string, fileBuffer: Buffer) => {
  const avatarUrl = await uploadAvatar(fileBuffer, userId);
  const user = await userRepo.updateUserAvatar(userId, avatarUrl);
  return user;
};

export const deleteUserAvatar = async (userId: string, currentAvatarUrl: string | null) => {
  try {
    if (currentAvatarUrl) {
      await deleteAvatar(currentAvatarUrl);
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
  }
  
  const user = await userRepo.removeUserAvatar(userId);
  return user;
};

export const getUserSubmissions = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [submissions, total] = await Promise.all([
    Submission.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('problemId', 'title slug difficulty'),
    Submission.countDocuments({ userId }),
  ]);
  
  return {
    submissions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};