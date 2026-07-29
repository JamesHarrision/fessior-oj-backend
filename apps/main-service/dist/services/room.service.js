"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomService = exports.RoomService = void 0;
const room_repository_1 = require("../repositories/room.repository");
const client_1 = require("@prisma/client");
const problem_model_1 = require("../models/problem.model");
const prisma_1 = require("../config/prisma");
const socket_1 = require("../sockets/socket");
const constants_1 = require("@ocj/constants");
class RoomService {
    async broadcastActiveRooms() {
        const activeRooms = await room_repository_1.roomRepository.findActiveRooms();
        socket_1.io?.to('lobby').emit(constants_1.SOCKET_EVENTS.ACTIVE_ROOMS_UPDATE, activeRooms);
    }
    async getCurrentRoom(userId) {
        const room = await room_repository_1.roomRepository.findCurrentActiveRoom(userId);
        return room;
    }
    async createRoom(creatorId, data) {
        const currentRoom = await room_repository_1.roomRepository.findCurrentActiveRoom(creatorId);
        if (currentRoom) {
            throw new Error('You are already in an active room. Leave it before creating a new one.');
        }
        let roomCode = '';
        let isUnique = false;
        while (!isUnique) {
            roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existing = await room_repository_1.roomRepository.findByCode(roomCode);
            if (!existing) {
                isUnique = true;
            }
        }
        if (data.problemId) {
            const problem = await problem_model_1.Problem.findById(data.problemId);
            if (!problem) {
                throw new Error('Problem not found');
            }
        }
        const newRoom = await room_repository_1.roomRepository.create({
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
        return room_repository_1.roomRepository.findActiveRooms();
    }
    async getRoomDetails(roomId) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        return room;
    }
    async joinRoom(roomCode, userId) {
        const room = await room_repository_1.roomRepository.findByCode(roomCode);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.status !== client_1.CustomRoomStatus.WAITING) {
            throw new Error('Room is not available');
        }
        const alreadyJoined = room.participants.some(p => p.user_id === userId);
        if (alreadyJoined) {
            return { room };
        }
        if (room.participants.length >= room.max_participants) {
            throw new Error('Room is full');
        }
        const currentRoom = await room_repository_1.roomRepository.findCurrentActiveRoom(userId);
        if (currentRoom && currentRoom.id !== room.id) {
            throw new Error('You are already in another active room. Leave it before joining this one.');
        }
        const updatedRoom = await room_repository_1.roomRepository.join(room.id, userId);
        const roomSocketName = `custom-room:${room.room_code}`;
        socket_1.io?.to(roomSocketName).emit(constants_1.SOCKET_EVENTS.PLAYER_JOINED, { userId });
        this.broadcastActiveRooms();
        return {
            room: updatedRoom,
        };
    }
    async kickPlayer(roomId, creatorId, targetUserId) {
        const room = await room_repository_1.roomRepository.findById(roomId);
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
        if (room.status !== client_1.CustomRoomStatus.WAITING) {
            throw new Error('Cannot kick from an active or finished room');
        }
        await room_repository_1.roomRepository.leave(roomId, targetUserId);
        const roomSocketName = `custom-room:${room.room_code}`;
        socket_1.io?.to(roomSocketName).emit(constants_1.SOCKET_EVENTS.PLAYER_KICKED, { userId: targetUserId });
        this.broadcastActiveRooms();
        return { success: true };
    }
    async startRoomMatch(roomId, creatorId) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.creator_id !== creatorId) {
            throw new Error('Only the creator can start the match');
        }
        if (room.status !== client_1.CustomRoomStatus.WAITING) {
            throw new Error('Room is not in waiting state');
        }
        if (room.participants.length < 2) {
            throw new Error('Need at least 2 players to start the match');
        }
        let problemId = room.problem_id;
        if (!problemId) {
            const query = {};
            if (room.difficulty) {
                query.difficulty = room.difficulty;
            }
            const count = await problem_model_1.Problem.countDocuments(query);
            if (count === 0) {
                const fallbackCount = await problem_model_1.Problem.countDocuments();
                if (fallbackCount === 0) {
                    throw new Error('No problems available for match');
                }
                const randomIndex = Math.floor(Math.random() * fallbackCount);
                const randomProblemList = await problem_model_1.Problem.find().skip(randomIndex).limit(1);
                problemId = randomProblemList[0]?._id.toString();
            }
            else {
                const randomIndex = Math.floor(Math.random() * count);
                const problemList = await problem_model_1.Problem.find(query).skip(randomIndex).limit(1);
                problemId = problemList[0]?._id.toString();
            }
        }
        if (!problemId) {
            throw new Error('Failed to select a problem for the match');
        }
        const match = await prisma_1.prisma.match.create({
            data: {
                problem_id: problemId,
                status: client_1.MatchStatus.PENDING,
                participants: {
                    create: room.participants.map(p => ({
                        user_id: p.user_id,
                        status: client_1.PlayerMatchStatus.CODING,
                        score_change: 0,
                        is_winner: false,
                    }))
                }
            },
            include: { participants: true }
        });
        const updatedRoom = await room_repository_1.roomRepository.updateStatus(room.id, client_1.CustomRoomStatus.PLAYING, match.id);
        const roomSocketName = `custom-room:${room.room_code}`;
        socket_1.io?.to(roomSocketName).emit(constants_1.SOCKET_EVENTS.MATCH_STARTED, {
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
    async leaveRoom(roomId, userId) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.status !== client_1.CustomRoomStatus.WAITING) {
            throw new Error('Cannot leave a room that has already started or finished');
        }
        if (room.creator_id === userId) {
            await room_repository_1.roomRepository.delete(roomId);
            const roomSocketName = `custom-room:${room.room_code}`;
            socket_1.io?.to(roomSocketName).emit('ROOM_DELETED');
        }
        else {
            await room_repository_1.roomRepository.leave(roomId, userId);
            const updatedRoom = await room_repository_1.roomRepository.findById(roomId);
            const roomSocketName = `custom-room:${room.room_code}`;
            socket_1.io?.to(roomSocketName).emit('ROOM_CONFIG_UPDATED', updatedRoom);
            socket_1.io?.to(roomSocketName).emit('PLAYER_LEFT', { userId });
        }
        this.broadcastActiveRooms();
        return { success: true };
    }
    async updateRoomConfig(roomId, creatorId, updates) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room)
            throw new Error('Room not found');
        if (room.creator_id !== creatorId)
            throw new Error('Permission denied');
        const updated = await prisma_1.prisma.customRoom.update({
            where: { id: roomId },
            data: {
                difficulty: updates.difficulty,
                max_participants: updates.maxParticipants,
                match_id: updates.matchId,
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
        socket_1.io?.to(roomSocketName).emit('ROOM_CONFIG_UPDATED', updated);
        this.broadcastActiveRooms();
        return updated;
    }
    async deleteRoom(roomId, creatorId) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room)
            throw new Error('Room not found');
        if (room.creator_id !== creatorId)
            throw new Error('Permission denied');
        await room_repository_1.roomRepository.delete(roomId);
        const roomSocketName = `custom-room:${room.room_code}`;
        socket_1.io?.to(roomSocketName).emit('ROOM_DELETED');
        this.broadcastActiveRooms();
    }
}
exports.RoomService = RoomService;
exports.roomService = new RoomService();
