import { prisma } from '../config/prisma';
import { FriendshipStatus } from '@prisma/client';

export class FriendshipRepository {
  async findFriendship(userId1: string, userId2: string) {
    return prisma.friendship.findFirst({
      where: {
        OR: [
          { sender_id: userId1, receiver_id: userId2 },
          { sender_id: userId2, receiver_id: userId1 },
        ],
      },
    });
  }

  async sendRequest(senderId: string, receiverId: string) {
    return prisma.friendship.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        status: FriendshipStatus.PENDING,
      },
    });
  }

  async acceptRequest(senderId: string, receiverId: string) {
    const friendship = await this.findFriendship(senderId, receiverId);
    if (!friendship) return null;

    return prisma.friendship.update({
      where: { id: friendship.id },
      data: {
        status: FriendshipStatus.ACCEPTED,
      },
    });
  }

  async declineRequest(senderId: string, receiverId: string) {
    const friendship = await this.findFriendship(senderId, receiverId);
    if (!friendship) return null;

    return prisma.friendship.delete({
      where: { id: friendship.id },
    });
  }

  async removeFriendship(userId: string, friendId: string) {
    const friendship = await this.findFriendship(userId, friendId);
    if (!friendship) return null;

    return prisma.friendship.delete({
      where: { id: friendship.id },
    });
  }

  async getFriendships(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, items] = await prisma.$transaction([
      prisma.friendship.count({
        where: {
          OR: [{ sender_id: userId }, { receiver_id: userId }],
          status: FriendshipStatus.ACCEPTED,
        },
      }),
      prisma.friendship.findMany({
        where: {
          OR: [{ sender_id: userId }, { receiver_id: userId }],
          status: FriendshipStatus.ACCEPTED,
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      items,
    };
  }

  async getPendingRequests(userId: string) {
    const [incoming, outgoing] = await Promise.all([
      prisma.friendship.findMany({
        where: {
          receiver_id: userId,
          status: FriendshipStatus.PENDING,
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.friendship.findMany({
        where: {
          sender_id: userId,
          status: FriendshipStatus.PENDING,
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      incoming,
      outgoing,
    };
  }
}

export const friendshipRepository = new FriendshipRepository();
