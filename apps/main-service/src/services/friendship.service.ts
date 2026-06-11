import { friendshipRepository } from '../repositories/friendship.repository';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';

export class FriendshipService {
  async sendRequest(senderId: string, receiverIdOrUsername: string) {
    let receiver = await prisma.user.findUnique({
      where: { id: receiverIdOrUsername },
    });

    if (!receiver) {
      receiver = await prisma.user.findUnique({
        where: { username: receiverIdOrUsername },
      });
    }

    if (!receiver) {
      throw new Error('Receiver user not found');
    }

    const receiverId = receiver.id;

    if (senderId === receiverId) {
      throw new Error('You cannot send a friend request to yourself');
    }

    const existing = await friendshipRepository.findFriendship(senderId, receiverId);
    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new Error('You are already friends');
      } else {
        throw new Error('A friend request is already pending between you');
      }
    }

    return friendshipRepository.sendRequest(senderId, receiverId);
  }

  async acceptRequest(userId: string, senderId: string) {
    const friendship = await friendshipRepository.findFriendship(senderId, userId);
    if (!friendship) {
      throw new Error('Friend request not found');
    }

    if (friendship.receiver_id !== userId) {
      throw new Error('You cannot accept this friend request');
    }

    if (friendship.status === 'ACCEPTED') {
      throw new Error('You are already friends');
    }

    return friendshipRepository.acceptRequest(senderId, userId);
  }

  async declineRequest(userId: string, senderId: string) {
    const friendship = await friendshipRepository.findFriendship(senderId, userId);
    if (!friendship) {
      throw new Error('Friend request not found');
    }

    if (friendship.receiver_id !== userId) {
      throw new Error('You cannot decline this friend request');
    }

    return friendshipRepository.declineRequest(senderId, userId);
  }

  async removeFriendship(userId: string, friendId: string) {
    const friendship = await friendshipRepository.findFriendship(userId, friendId);
    if (!friendship || friendship.status !== 'ACCEPTED') {
      throw new Error('Friendship not found');
    }

    return friendshipRepository.removeFriendship(userId, friendId);
  }

  async getFriends(userId: string, page = 1, limit = 10) {
    const result = await friendshipRepository.getFriendships(userId, page, limit);

    // Identify friend IDs from friendship records
    const friendIds = result.items.map((item) =>
      item.sender_id === userId ? item.receiver_id : item.sender_id
    );

    if (friendIds.length === 0) {
      return {
        ...result,
        items: [],
      };
    }

    // Fetch user details
    const users = await prisma.user.findMany({
      where: { id: { in: friendIds } },
      select: { id: true, username: true, elo_rating: true, avatar_url: true },
    });

    // Check online status in Redis
    const onlineMap = new Map<string, boolean>();
    await Promise.all(
      friendIds.map(async (id) => {
        const isOnline = await redis.sismember('online_users', id);
        onlineMap.set(id, isOnline === 1);
      })
    );

    const enrichedItems = users.map((user) => ({
      ...user,
      online: onlineMap.get(user.id) || false,
    }));

    return {
      ...result,
      items: enrichedItems,
    };
  }

  async getPendingRequests(userId: string) {
    const { incoming, outgoing } = await friendshipRepository.getPendingRequests(userId);

    // Fetch users details for incoming requests
    const incomingSenderIds = incoming.map((r) => r.sender_id);
    const incomingSenders = await prisma.user.findMany({
      where: { id: { in: incomingSenderIds } },
      select: { id: true, username: true, elo_rating: true, avatar_url: true },
    });
    const incomingSendersMap = new Map(incomingSenders.map((u) => [u.id, u]));

    // Fetch users details for outgoing requests
    const outgoingReceiverIds = outgoing.map((r) => r.receiver_id);
    const outgoingReceivers = await prisma.user.findMany({
      where: { id: { in: outgoingReceiverIds } },
      select: { id: true, username: true, elo_rating: true, avatar_url: true },
    });
    const outgoingReceiversMap = new Map(outgoingReceivers.map((u) => [u.id, u]));

    return {
      incoming: incoming.map((req) => ({
        id: req.id,
        created_at: req.created_at,
        sender: incomingSendersMap.get(req.sender_id) || null,
      })),
      outgoing: outgoing.map((req) => ({
        id: req.id,
        created_at: req.created_at,
        receiver: outgoingReceiversMap.get(req.receiver_id) || null,
      })),
    };
  }
}

export const friendshipService = new FriendshipService();
