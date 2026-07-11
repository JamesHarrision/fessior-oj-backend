import { roomRepository } from '../repositories/room.repository';
import { CustomRoomStatus, Difficulty, MatchStatus, PlayerMatchStatus } from '@prisma/client';
import { Problem } from '../models/problem.model';
import { prisma } from '../config/prisma';
import { io } from '../sockets/socket';
import { SOCKET_EVENTS } from '@ocj/constants';

export class RoomService {
  private async broadcastActiveRooms() {
    const activeRooms = await roomRepository.findActiveRooms();
    io?.to('lobby').emit(SOCKET_EVENTS.ACTIVE_ROOMS_UPDATE, activeRooms);
  }

  async getCurrentRoom(userId: string) {
    const room = await roomRepository.findCurrentActiveRoom(userId);
    return room;
  }

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
    const currentRoom = await roomRepository.findCurrentActiveRoom(creatorId);
    if (currentRoom) {
      throw new Error('You are already in an active room. Leave it before creating a new one.');
    }

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

    const newRoom = await roomRepository.create({
      roomCode,
      creatorId,
      problemId: data.problemId,
      difficulty: data.difficulty,
      timeLimit: data.timeLimit,
      memoryLimit: data.memoryLimit,
      maxParticipants: data.maxParticipants || 10,
    });

    this.broadcastActiveRooms();
    return newRoom;
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

    const alreadyJoined = room.participants.some(p => p.user_id === userId);
    if (alreadyJoined) {
      return { room };
    }

    if (room.participants.length >= room.max_participants) {
      throw new Error('Room is full');
    }

    const currentRoom = await roomRepository.findCurrentActiveRoom(userId);
    if (currentRoom && currentRoom.id !== room.id) {
      throw new Error('You are already in another active room. Leave it before joining this one.');
    }

    const updatedRoom = await roomRepository.join(room.id, userId);

    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit(SOCKET_EVENTS.PLAYER_JOINED, { userId });
    this.broadcastActiveRooms();

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
    this.broadcastActiveRooms();

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
        const randomProblemList = await Problem.find().skip(randomIndex).limit(1);
        problemId = randomProblemList[0]?._id.toString() as string;
      } else {
        const randomIndex = Math.floor(Math.random() * count);
        const problemList = await Problem.find(query).skip(randomIndex).limit(1);
        problemId = problemList[0]?._id.toString() as string;
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
    
    this.broadcastActiveRooms();

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
      await roomRepository.delete(roomId);
      const roomSocketName = `custom-room:${room.room_code}`;
      io?.to(roomSocketName).emit('ROOM_DELETED');
    } else {
      await roomRepository.leave(roomId, userId);
      const updatedRoom = await roomRepository.findById(roomId);
      const roomSocketName = `custom-room:${room.room_code}`;
      io?.to(roomSocketName).emit('ROOM_CONFIG_UPDATED', updatedRoom);
      io?.to(roomSocketName).emit('PLAYER_LEFT', { userId });
    }
    
    this.broadcastActiveRooms();
    return { success: true };
  }

  async updateRoomConfig(roomId: string, creatorId: string, updates: any) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');
    if (room.creator_id !== creatorId) throw new Error('Permission denied');

    const updated = await prisma.customRoom.update({
      where: { id: roomId },
      data: {
        difficulty: updates.difficulty,
        max_participants: updates.maxParticipants,
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

    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit('ROOM_CONFIG_UPDATED', updated);
    this.broadcastActiveRooms();

    return updated;
  }

  async deleteRoom(roomId: string, creatorId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');
    if (room.creator_id !== creatorId) throw new Error('Permission denied');

    await roomRepository.delete(roomId);
    const roomSocketName = `custom-room:${room.room_code}`;
    io?.to(roomSocketName).emit('ROOM_DELETED');
    this.broadcastActiveRooms();
  }

}

export const roomService = new RoomService();
