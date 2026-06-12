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

export const getUserContests = async (userId: string, page: number = 1, limit: number = 10) => {
  return await userRepo.getUserContests(userId, page, limit);
};

export const getUserBadges = async (userId: string) => {
  const userBadges = await userRepo.getUserBadges(userId);
  
  return userBadges.map(ub => ({
    id: ub.badge.id,
    name: ub.badge.name,
    slug: ub.badge.slug,
    description: ub.badge.description,
    icon_url: ub.badge.icon_url,
    type: ub.badge.type,
    earned_at: ub.earned_at,
  }));
};

export const getUserTagStats = async (userId: string) => {
  const tagStats = await userRepo.getUserTagStats(userId);
  
  return tagStats.map(ts => ({
    tag_id: ts.tag.id,
    tag_name: ts.tag.name,
    tag_slug: ts.tag.slug,
    tag_color: ts.tag.color,
    problems_solved: ts.problems_solved,
  }));
};

export const getUserEloHistory = async (userId: string, page: number = 1, limit: number = 10) => {
  return await userRepo.getUserEloHistory(userId, page, limit);
};

export const getUserStreak = async (userId: string) => {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 364); 
  
  const activities = await userRepo.getUserActivities(userId, startDate, endDate);
  
  const heatmap: Record<string, number> = {};
  activities.forEach(activity => {
    const dateStr = activity.activity_date.toISOString().split('T')[0];
    heatmap[dateStr] = activity.problems_solved_count;
  });
  
  return {
    current_streak: user.streak_count,
    max_streak: user.max_streak,
    last_active_date: user.last_active_date,
    heatmap,
  };
};

export const getAllUsers = async (page: number, limit: number, search?: string) => {
  return await userRepo.getAllUsers(page, limit, search);
};