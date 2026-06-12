import { prisma } from '../config/prisma';

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      avatar_url: true,
      role: true,
      elo_rating: true,
      streak_count: true,
      max_streak: true,
      code_coins: true,
      bio: true,
      full_name: true,
      created_at: true,
    },
  });
};

export const updateUserById = async (id: string, data: { full_name?: string; bio?: string }) => {
  return prisma.user.update({
    where: { id },
    data: {
      full_name: data.full_name,
      bio: data.bio,
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatar_url: true,
      role: true,
      elo_rating: true,
      streak_count: true,
      max_streak: true,
      code_coins: true,
      bio: true,
      full_name: true,
      created_at: true,
      updated_at: true,
    },
  });
};