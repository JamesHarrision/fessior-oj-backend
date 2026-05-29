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
  }) {
    return prisma.customRoom.create({
      data: {
        room_code: data.roomCode,
        creator_id: data.creatorId,
        problem_id: data.problemId,
        difficulty: data.difficulty,
        time_limit: data.timeLimit,
        memory_limit: data.memoryLimit,
        status: CustomRoomStatus.WAITING,
      },
      include: {
        creator: {
          select: { id: true, username: true, elo_rating: true, avatar_url: true },
        },
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
        opponent: {
          select: { id: true, username: true, elo_rating: true, avatar_url: true },
        },
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
        opponent: {
          select: { id: true, username: true, elo_rating: true, avatar_url: true },
        },
      },
    });
  }

  async findActiveRooms() {
    return prisma.customRoom.findMany({
      where: {
        status: CustomRoomStatus.WAITING,
        opponent_id: null,
      },
      include: {
        creator: {
          select: { id: true, username: true, elo_rating: true, avatar_url: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async join(id: string, opponentId: string) {
    return prisma.customRoom.update({
      where: { id },
      data: {
        opponent_id: opponentId,
      },
      include: {
        creator: {
          select: { id: true, username: true, elo_rating: true, avatar_url: true },
        },
        opponent: {
          select: { id: true, username: true, elo_rating: true, avatar_url: true },
        },
      },
    });
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

  async updateConfig(
    id: string,
    data: {
      problemId?: string;
      difficulty?: Difficulty;
      timeLimit?: number;
      memoryLimit?: number;
    }
  ) {
    return prisma.customRoom.update({
      where: { id },
      data: {
        problem_id: data.problemId,
        difficulty: data.difficulty,
        time_limit: data.timeLimit,
        memory_limit: data.memoryLimit,
      },
      include: {
        creator: {
          select: { id: true, username: true, elo_rating: true, avatar_url: true },
        },
        opponent: {
          select: { id: true, username: true, elo_rating: true, avatar_url: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.customRoom.delete({
      where: { id },
    });
  }

  async leave(id: string, userId: string) {
    const room = await this.findById(id);
    if (!room) return null;

    if (room.creator_id === userId) {
      // Nếu chủ phòng rời đi, hủy luôn phòng
      return this.delete(id);
    } else if (room.opponent_id === userId) {
      // Nếu đối thủ rời đi, xóa opponent_id để phòng tiếp tục WAITING
      return prisma.customRoom.update({
        where: { id },
        data: {
          opponent_id: null,
          status: CustomRoomStatus.WAITING,
        },
        include: {
          creator: {
            select: { id: true, username: true, elo_rating: true, avatar_url: true },
          },
          opponent: {
            select: { id: true, username: true, elo_rating: true, avatar_url: true },
          },
        },
      });
    }
    return room;
  }
}

export const roomRepository = new RoomRepository();
