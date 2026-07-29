"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRepository = exports.RoomRepository = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
class RoomRepository {
    async create(data) {
        return prisma_1.prisma.customRoom.create({
            data: {
                room_code: data.roomCode,
                creator_id: data.creatorId,
                problem_id: data.problemId,
                difficulty: data.difficulty,
                time_limit: data.timeLimit,
                memory_limit: data.memoryLimit,
                max_participants: data.maxParticipants || 10,
                status: client_1.CustomRoomStatus.WAITING,
                participants: {
                    create: {
                        user_id: data.creatorId,
                        is_ready: true, // Creator is automatically ready
                    }
                }
            },
            include: {
                creator: {
                    select: { id: true, username: true, elo_rating: true, avatar_url: true },
                },
                participants: {
                    include: {
                        user: { select: { id: true, username: true, elo_rating: true, avatar_url: true } }
                    }
                }
            },
        });
    }
    async findByCode(roomCode) {
        return prisma_1.prisma.customRoom.findUnique({
            where: { room_code: roomCode },
            include: {
                creator: {
                    select: { id: true, username: true, elo_rating: true, avatar_url: true },
                },
                participants: {
                    include: {
                        user: { select: { id: true, username: true, elo_rating: true, avatar_url: true } }
                    }
                }
            },
        });
    }
    async findById(id) {
        return prisma_1.prisma.customRoom.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true, username: true, elo_rating: true, avatar_url: true },
                },
                participants: {
                    include: {
                        user: { select: { id: true, username: true, elo_rating: true, avatar_url: true } }
                    }
                }
            },
        });
    }
    async findActiveRooms() {
        const rooms = await prisma_1.prisma.customRoom.findMany({
            where: {
                status: client_1.CustomRoomStatus.WAITING,
            },
            include: {
                creator: {
                    select: { id: true, username: true, elo_rating: true, avatar_url: true },
                },
                participants: {
                    include: {
                        user: { select: { id: true, username: true, elo_rating: true, avatar_url: true } }
                    }
                },
                _count: {
                    select: { participants: true }
                }
            },
            orderBy: { created_at: 'desc' },
        });
        // Filter out rooms that are already full
        return rooms.filter(r => r._count.participants < r.max_participants);
    }
    async findCurrentActiveRoom(userId) {
        return prisma_1.prisma.customRoom.findFirst({
            where: {
                status: { in: [client_1.CustomRoomStatus.WAITING, client_1.CustomRoomStatus.PLAYING] },
                participants: {
                    some: { user_id: userId }
                }
            },
            include: {
                creator: {
                    select: { id: true, username: true, elo_rating: true, avatar_url: true },
                },
                participants: {
                    include: {
                        user: { select: { id: true, username: true, elo_rating: true, avatar_url: true } }
                    }
                }
            },
        });
    }
    async join(id, userId) {
        await prisma_1.prisma.customRoomParticipant.create({
            data: {
                room_id: id,
                user_id: userId,
                is_ready: false,
            }
        });
        return this.findById(id);
    }
    async leave(roomId, userId) {
        await prisma_1.prisma.customRoomParticipant.delete({
            where: {
                room_id_user_id: {
                    room_id: roomId,
                    user_id: userId,
                }
            }
        });
        // If no participants left, maybe delete room? Handled in service.
    }
    async updateStatus(id, status, matchId) {
        return prisma_1.prisma.customRoom.update({
            where: { id },
            data: {
                status,
                match_id: matchId,
            },
        });
    }
    async delete(id) {
        return prisma_1.prisma.customRoom.delete({
            where: { id },
        });
    }
}
exports.RoomRepository = RoomRepository;
exports.roomRepository = new RoomRepository();
