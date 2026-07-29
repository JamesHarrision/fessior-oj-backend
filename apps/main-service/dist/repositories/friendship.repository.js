"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendshipRepository = exports.FriendshipRepository = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
class FriendshipRepository {
    async findFriendship(userId1, userId2) {
        return prisma_1.prisma.friendship.findFirst({
            where: {
                OR: [
                    { sender_id: userId1, receiver_id: userId2 },
                    { sender_id: userId2, receiver_id: userId1 },
                ],
            },
        });
    }
    async sendRequest(senderId, receiverId) {
        return prisma_1.prisma.friendship.create({
            data: {
                sender_id: senderId,
                receiver_id: receiverId,
                status: client_1.FriendshipStatus.PENDING,
            },
        });
    }
    async acceptRequest(senderId, receiverId) {
        const friendship = await this.findFriendship(senderId, receiverId);
        if (!friendship)
            return null;
        return prisma_1.prisma.friendship.update({
            where: { id: friendship.id },
            data: {
                status: client_1.FriendshipStatus.ACCEPTED,
            },
        });
    }
    async declineRequest(senderId, receiverId) {
        const friendship = await this.findFriendship(senderId, receiverId);
        if (!friendship)
            return null;
        return prisma_1.prisma.friendship.delete({
            where: { id: friendship.id },
        });
    }
    async removeFriendship(userId, friendId) {
        const friendship = await this.findFriendship(userId, friendId);
        if (!friendship)
            return null;
        return prisma_1.prisma.friendship.delete({
            where: { id: friendship.id },
        });
    }
    async getFriendships(userId, page, limit) {
        const skip = (page - 1) * limit;
        const [total, items] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.friendship.count({
                where: {
                    OR: [{ sender_id: userId }, { receiver_id: userId }],
                    status: client_1.FriendshipStatus.ACCEPTED,
                },
            }),
            prisma_1.prisma.friendship.findMany({
                where: {
                    OR: [{ sender_id: userId }, { receiver_id: userId }],
                    status: client_1.FriendshipStatus.ACCEPTED,
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
    async getPendingRequests(userId) {
        const [incoming, outgoing] = await Promise.all([
            prisma_1.prisma.friendship.findMany({
                where: {
                    receiver_id: userId,
                    status: client_1.FriendshipStatus.PENDING,
                },
                orderBy: { created_at: 'desc' },
            }),
            prisma_1.prisma.friendship.findMany({
                where: {
                    sender_id: userId,
                    status: client_1.FriendshipStatus.PENDING,
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
exports.FriendshipRepository = FriendshipRepository;
exports.friendshipRepository = new FriendshipRepository();
