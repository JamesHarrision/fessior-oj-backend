import { prisma } from '../config/prisma';
import { CustomRoomStatus, Difficulty } from '@prisma/client';

export class RoomRepository {
  async create(data: {
    roomCode: string;
    creatorId: string;
    problemId?: string;
    difficulty?: Difficulty;
    timeLimit?: number;
    memoryLimit?: number;
    maxParticipants?: number;
  }) {
    return prisma.customRoom.create({
      data: {
        room_code: data.roomCode,
        creator_id: data.creatorId,
        problem_id: data.problemId,
        difficulty: data.difficulty,
        time_limit: data.timeLimit,
        memory_limit: data.memoryLimit,
        max_participants: data.maxParticipants || 10,
        status: CustomRoomStatus.WAITING,
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

  async findByCode(roomCode: string) {
    return prisma.customRoom.findUnique({
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

  async findById(id: string) {
    return prisma.customRoom.findUnique({
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
    const rooms = await prisma.customRoom.findMany({
      where: {
        status: CustomRoomStatus.WAITING,
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

  async findCurrentActiveRoom(userId: string) {
    return prisma.customRoom.findFirst({
      where: {
        status: { in: [CustomRoomStatus.WAITING, CustomRoomStatus.PLAYING] },
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

  async join(id: string, userId: string) {
    await prisma.customRoomParticipant.create({
      data: {
        room_id: id,
        user_id: userId,
        is_ready: false,
      }
    });

    return this.findById(id);
  }

  async leave(roomId: string, userId: string) {
    await prisma.customRoomParticipant.delete({
      where: {
        room_id_user_id: {
          room_id: roomId,
          user_id: userId,
        }
      }
    });

    // If no participants left, maybe delete room? Handled in service.
  }

  async updateStatus(id: string, status: CustomRoomStatus, matchId?: string) {
    return prisma.customRoom.update({
      where: { id },
      data: {
        status,
        match_id: matchId,
      },
    });
  }

  async delete(id: string) {
    return prisma.customRoom.delete({
      where: { id },
    });
  }
}

export const roomRepository = new RoomRepository();
