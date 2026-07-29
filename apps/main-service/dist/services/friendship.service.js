"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendshipService = exports.FriendshipService = void 0;
const friendship_repository_1 = require("../repositories/friendship.repository");
const prisma_1 = require("../config/prisma");
const redis_1 = require("../config/redis");
class FriendshipService {
    async sendRequest(senderId, receiverIdOrUsername) {
        let receiver = await prisma_1.prisma.user.findUnique({
            where: { id: receiverIdOrUsername },
        });
        if (!receiver) {
            receiver = await prisma_1.prisma.user.findUnique({
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
        const existing = await friendship_repository_1.friendshipRepository.findFriendship(senderId, receiverId);
        if (existing) {
            if (existing.status === 'ACCEPTED') {
                throw new Error('You are already friends');
            }
            else {
                throw new Error('A friend request is already pending between you');
            }
        }
        return friendship_repository_1.friendshipRepository.sendRequest(senderId, receiverId);
    }
    async acceptRequest(userId, senderId) {
        const friendship = await friendship_repository_1.friendshipRepository.findFriendship(senderId, userId);
        if (!friendship) {
            throw new Error('Friend request not found');
        }
        if (friendship.receiver_id !== userId) {
            throw new Error('You cannot accept this friend request');
        }
        if (friendship.status === 'ACCEPTED') {
            throw new Error('You are already friends');
        }
        return friendship_repository_1.friendshipRepository.acceptRequest(senderId, userId);
    }
    async declineRequest(userId, senderId) {
        const friendship = await friendship_repository_1.friendshipRepository.findFriendship(senderId, userId);
        if (!friendship) {
            throw new Error('Friend request not found');
        }
        if (friendship.receiver_id !== userId) {
            throw new Error('You cannot decline this friend request');
        }
        return friendship_repository_1.friendshipRepository.declineRequest(senderId, userId);
    }
    async removeFriendship(userId, friendId) {
        const friendship = await friendship_repository_1.friendshipRepository.findFriendship(userId, friendId);
        if (!friendship || friendship.status !== 'ACCEPTED') {
            throw new Error('Friendship not found');
        }
        return friendship_repository_1.friendshipRepository.removeFriendship(userId, friendId);
    }
    async getFriends(userId, page = 1, limit = 10) {
        const result = await friendship_repository_1.friendshipRepository.getFriendships(userId, page, limit);
        // Identify friend IDs from friendship records
        const friendIds = result.items.map((item) => item.sender_id === userId ? item.receiver_id : item.sender_id);
        if (friendIds.length === 0) {
            return {
                ...result,
                items: [],
            };
        }
        // Fetch user details
        const users = await prisma_1.prisma.user.findMany({
            where: { id: { in: friendIds } },
            select: { id: true, username: true, elo_rating: true, avatar_url: true },
        });
        // Check online status in Redis
        const onlineMap = new Map();
        await Promise.all(friendIds.map(async (id) => {
            const isOnline = await redis_1.redis.sismember('online_users', id);
            onlineMap.set(id, isOnline === 1);
        }));
        const enrichedItems = users.map((user) => ({
            ...user,
            online: onlineMap.get(user.id) || false,
        }));
        return {
            ...result,
            items: enrichedItems,
        };
    }
    async getPendingRequests(userId) {
        const { incoming, outgoing } = await friendship_repository_1.friendshipRepository.getPendingRequests(userId);
        // Fetch users details for incoming requests
        const incomingSenderIds = incoming.map((r) => r.sender_id);
        const incomingSenders = await prisma_1.prisma.user.findMany({
            where: { id: { in: incomingSenderIds } },
            select: { id: true, username: true, elo_rating: true, avatar_url: true },
        });
        const incomingSendersMap = new Map(incomingSenders.map((u) => [u.id, u]));
        // Fetch users details for outgoing requests
        const outgoingReceiverIds = outgoing.map((r) => r.receiver_id);
        const outgoingReceivers = await prisma_1.prisma.user.findMany({
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
exports.FriendshipService = FriendshipService;
exports.friendshipService = new FriendshipService();
