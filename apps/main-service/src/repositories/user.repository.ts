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

export const findUserByUsername = async (username: string) => {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
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

export const updateUserAvatar = async (id: string, avatarUrl: string) => {
  return prisma.user.update({
    where: { id },
    data: { avatar_url: avatarUrl },
    select: { id: true, username: true, avatar_url: true },
  });
};

export const removeUserAvatar = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { avatar_url: null },
    select: {
      id: true,
      username: true,
      avatar_url: true,
    },
  });
};

export const getUserContests = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [contests, total] = await Promise.all([
    prisma.contestRegistration.findMany({
      where: { user_id: userId },
      skip,
      take: limit,
      orderBy: { registered_at: 'desc' },
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            description: true,
            start_time: true,
            end_time: true,
          },
        },
      },
    }),
    prisma.contestRegistration.count({
      where: { user_id: userId },
    }),
  ]);
  
  return {
    contests: contests.map(reg => ({
      registered_at: reg.registered_at,
      contest: reg.contest,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserBadges = async (userId: string) => {
  return prisma.userBadge.findMany({
    where: { user_id: userId },
    include: {
      badge: true,
    },
    orderBy: { earned_at: 'desc' },
  });
};

export const getUserTagStats = async (userId: string) => {
  return prisma.userTagStat.findMany({
    where: { user_id: userId },
    include: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
    orderBy: {
      problems_solved: 'desc',
    },
  });
};