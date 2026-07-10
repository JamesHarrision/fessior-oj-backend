import { roomRepository } from '../repositories/room.repository';
import { CustomRoomStatus, Difficulty, MatchStatus, PlayerMatchStatus } from '@prisma/client';
import { Problem } from '../models/problem.model';
import { prisma } from '../config/prisma';
import { io } from '../sockets/socket';
import { SOCKET_EVENTS } from '@ocj/constants';

export class RoomService {
  async createRoom(
    creatorId: string,
    data: {
      problemId?: string;
      difficulty?: Difficulty;
      timeLimit?: number;
      memoryLimit?: number;
      maxParticipants?: number;
    }
  ) {
    let roomCode = '';
    let isUnique = false;
    while (!isUnique) {
      roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await roomRepository.findByCode(roomCode);
      if (!existing) {
        isUnique = true;
      }
    }

    if (data.problemId) {
      const problem = await Problem.findById(data.problemId);
      if (!problem) {
        throw new Error('Problem not found');
      }
    }

    return roomRepository.create({
      roomCode,
      creatorId,
      problemId: data.problemId,
      difficulty: data.difficulty,
      timeLimit: data.timeLimit,
      memoryLimit: data.memoryLimit,
      maxParticipants: data.maxParticipants || 10,
    });
  }

  async getActiveRooms() {
    return roomRepository.findActiveRooms();
  }

  async getRoomDetails(roomId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }

  async joinRoom(roomCode: string, userId: string) {
    const room = await roomRepository.findByCode(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== CustomRoomStatus.WAITING) {
      throw new Error('Room is not available');
    }

    if (room.participants.length >= room.max_participants) {
      throw new Error('Room is full');
    }

    const alreadyJoined = room.participants.some(p => p.user_id === userId);
    if (alreadyJoined) {
      throw new Error('You have already joined this room');
    }

    const updatedRoom = await roomRepository.join(room.id, userId);

    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit(SOCKET_EVENTS.PLAYER_JOINED, { userId });

    return {
      room: updatedRoom,
    };
  }

  async kickPlayer(roomId: string, creatorId: string, targetUserId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.creator_id !== creatorId) {
      throw new Error('Only the creator can kick players');
    }

    const isInRoom = room.participants.some(p => p.user_id === targetUserId);
    if (!isInRoom) {
      throw new Error('Player is not in the room');
    }

    if (room.status !== CustomRoomStatus.WAITING) {
      throw new Error('Cannot kick from an active or finished room');
    }

    await roomRepository.leave(roomId, targetUserId);
    
    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit(SOCKET_EVENTS.PLAYER_KICKED, { userId: targetUserId });

    return { success: true };
  }

  async startRoomMatch(roomId: string, creatorId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.creator_id !== creatorId) {
      throw new Error('Only the creator can start the match');
    }

    if (room.status !== CustomRoomStatus.WAITING) {
      throw new Error('Room is not in waiting state');
    }

    if (room.participants.length < 2) {
      throw new Error('Need at least 2 players to start the match');
    }

    let problemId = room.problem_id;
    if (!problemId) {
      const query: any = {};
      if (room.difficulty) {
        query.difficulty = room.difficulty;
      }
      const count = await Problem.countDocuments(query);
      if (count === 0) {
        const fallbackCount = await Problem.countDocuments();
        if (fallbackCount === 0) {
          throw new Error('No problems available for match');
        }
        const randomIndex = Math.floor(Math.random() * fallbackCount);
        const randomProblem = await Problem.findOne().skip(randomIndex);
        problemId = randomProblem?._id.toString() as string;
      } else {
        const randomIndex = Math.floor(Math.random() * count);
        const problem = await Problem.findOne(query).skip(randomIndex);
        problemId = problem?._id.toString() as string;
      }
    }

    if (!problemId) {
      throw new Error('Failed to select a problem for the match');
    }

    const match = await prisma.match.create({
      data: {
        problem_id: problemId,
        status: MatchStatus.PENDING,
        participants: {
          create: room.participants.map(p => ({
            user_id: p.user_id,
            status: PlayerMatchStatus.CODING,
            score_change: 0,
            is_winner: false,
          }))
        }
      },
      include: { participants: true }
    });

    const updatedRoom = await roomRepository.updateStatus(room.id, CustomRoomStatus.PLAYING, match.id);

    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit(SOCKET_EVENTS.MATCH_STARTED, {
      matchId: match.id,
      roomId: room.id,
      problemId,
    });

    return {
      room: updatedRoom,
      matchId: match.id,
    };
  }

  async leaveRoom(roomId: string, userId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== CustomRoomStatus.WAITING) {
      throw new Error('Cannot leave a room that has already started or finished');
    }

    if (room.creator_id === userId) {
      // If creator leaves, delete the room
      await roomRepository.delete(roomId);
      const roomSocketName = `custom-room:${room.room_code}`;
      io?.to(roomSocketName).emit(SOCKET_EVENTS.ROOM_DELETED, { roomId });
      return { deleted: true };
    } else {
      await roomRepository.leave(roomId, userId);
      const roomSocketName = `custom-room:${room.room_code}`;
      io?.to(roomSocketName).emit(SOCKET_EVENTS.PLAYER_LEFT, { userId });
      return { deleted: false };
    }
  }

  async updateRoomConfig(roomId: string, creatorId: string, data: Partial<{ difficulty: Difficulty, timeLimit: number, memoryLimit: number }>) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    if (room.creator_id !== creatorId) {
      throw new Error('Only the creator can update the room configuration');
    }

    const updatedRoom = await prisma.customRoom.update({
      where: { id: roomId },
      data: {
        difficulty: data.difficulty,
        time_limit: data.timeLimit,
        memory_limit: data.memoryLimit,
      },
      include: {
        creator: { select: { id: true, username: true, elo_rating: true, avatar_url: true } },
        participants: { include: { user: { select: { id: true, username: true, elo_rating: true, avatar_url: true } } } }
      }
    });

    const roomSocketName = `custom-room:${updatedRoom.room_code}`;
    io?.to(roomSocketName).emit(SOCKET_EVENTS.CONFIG_UPDATED, { room: updatedRoom });
    return updatedRoom;
  }

  async deleteRoom(roomId: string, creatorId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');
    if (room.creator_id !== creatorId) throw new Error('Only the creator can delete the room');

    await roomRepository.delete(roomId);
    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit(SOCKET_EVENTS.ROOM_DELETED, { roomId });
  }
}

export const roomService = new RoomService();
