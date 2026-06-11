import { roomRepository } from '../repositories/room.repository';
import { CustomRoomStatus, Difficulty, MatchStatus } from '@prisma/client';
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
    }
  ) {
    // 1. Generate unique room code (6 characters)
    let roomCode = '';
    let isUnique = false;
    while (!isUnique) {
      roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await roomRepository.findByCode(roomCode);
      if (!existing) {
        isUnique = true;
      }
    }

    // 2. Validate problem if specified
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

  async joinRoom(roomCode: string, opponentId: string) {
    const room = await roomRepository.findByCode(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== CustomRoomStatus.WAITING || room.opponent_id) {
      throw new Error('Room is not available');
    }

    if (room.creator_id === opponentId) {
      throw new Error('You cannot join your own room');
    }

    // 1. Update room with opponentId
    const updatedRoom = await roomRepository.join(room.id, opponentId);

    // 2. Select problem for the match
    let problemId = room.problem_id;
    if (!problemId) {
      // If no specific problem selected, find one by difficulty or random
      const query: any = {};
      if (room.difficulty) {
        query.difficulty = room.difficulty;
      }
      const count = await Problem.countDocuments(query);
      if (count === 0) {
        // Fallback to any problem
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

    // 3. Create a running Match in MySQL
    const match = await prisma.match.create({
      data: {
        player1_id: room.creator_id,
        player2_id: opponentId,
        problem_id: problemId,
        status: MatchStatus.PENDING,
      },
    });

    // 4. Update Room status to PLAYING and set match_id
    await roomRepository.updateStatus(room.id, CustomRoomStatus.PLAYING, match.id);

    // 5. Emit socket events to both players if they are connected
    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit(SOCKET_EVENTS.MATCH_STARTED, {
      matchId: match.id,
      roomId: room.id,
      problemId,
    });

    return {
      room: {
        ...updatedRoom,
        status: CustomRoomStatus.PLAYING,
        match_id: match.id,
      },
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

    const result = await roomRepository.leave(roomId, userId);

    // Notify other players via socket
    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit(SOCKET_EVENTS.PLAYER_LEFT, { userId });

    return result;
  }

  async updateRoomConfig(
    roomId: string,
    creatorId: string,
    data: {
      problemId?: string;
      difficulty?: Difficulty;
      timeLimit?: number;
      memoryLimit?: number;
    }
  ) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.creator_id !== creatorId) {
      throw new Error('Only the creator can update room config');
    }

    if (room.status !== CustomRoomStatus.WAITING) {
      throw new Error('Cannot update config of an active or finished room');
    }

    if (data.problemId) {
      const problem = await Problem.findById(data.problemId);
      if (!problem) {
        throw new Error('Problem not found');
      }
    }

    const updated = await roomRepository.updateConfig(roomId, data);

    // Notify room of configuration change
    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit(SOCKET_EVENTS.CONFIG_UPDATED, updated);

    return updated;
  }

  async deleteRoom(roomId: string, creatorId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.creator_id !== creatorId) {
      throw new Error('Only the creator can delete the room');
    }

    await roomRepository.delete(roomId);

    // Notify room of deletion
    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit(SOCKET_EVENTS.ROOM_DELETED);

    return { success: true };
  }
}

export const roomService = new RoomService();
