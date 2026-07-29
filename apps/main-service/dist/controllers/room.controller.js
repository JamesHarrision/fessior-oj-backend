"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = exports.RoomController = void 0;
const room_service_1 = require("../services/room.service");
class RoomController {
    async createRoom(req, res) {
        try {
            const creatorId = req.user.userId;
            const room = await room_service_1.roomService.createRoom(creatorId, req.body);
            res.status(201).json({
                status: 'Success',
                message: 'Room created successfully',
                data: room,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async getCurrentRoom(req, res) {
        try {
            const userId = req.user.userId;
            const room = await room_service_1.roomService.getCurrentRoom(userId);
            res.status(200).json({
                status: 'Success',
                message: 'Current room fetched successfully',
                data: room,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async getActiveRooms(req, res) {
        try {
            const rooms = await room_service_1.roomService.getActiveRooms();
            res.status(200).json({
                status: 'Success',
                message: 'Active rooms fetched successfully',
                data: rooms,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async getRoomDetails(req, res) {
        try {
            const roomId = req.params.roomId;
            const room = await room_service_1.roomService.getRoomDetails(roomId);
            res.status(200).json({
                status: 'Success',
                message: 'Room details fetched successfully',
                data: room,
            });
        }
        catch (error) {
            res.status(404).json({ status: 'Error', message: error.message });
        }
    }
    async joinRoom(req, res) {
        try {
            const opponentId = req.user.userId;
            const { roomCode } = req.body;
            const result = await room_service_1.roomService.joinRoom(roomCode, opponentId);
            res.status(200).json({
                status: 'Success',
                message: 'Success',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async leaveRoom(req, res) {
        try {
            const userId = req.user.userId;
            const { roomId } = req.body;
            const result = await room_service_1.roomService.leaveRoom(roomId, userId);
            res.status(200).json({
                status: 'Success',
                message: 'Success',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async kickPlayer(req, res) {
        try {
            const creatorId = req.user.userId;
            const { roomId, opponentId } = req.body;
            const result = await room_service_1.roomService.kickPlayer(roomId, creatorId, opponentId);
            res.status(200).json({
                status: 'Success',
                message: 'Success',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async startMatch(req, res) {
        try {
            const creatorId = req.user.userId;
            const { roomId } = req.body;
            const result = await room_service_1.roomService.startRoomMatch(roomId, creatorId);
            res.status(200).json({
                status: 'Success',
                message: 'Success',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async updateRoomConfig(req, res) {
        try {
            const creatorId = req.user.userId;
            const roomId = req.params.roomId;
            const updated = await room_service_1.roomService.updateRoomConfig(roomId, creatorId, req.body);
            res.status(200).json({
                status: 'Success',
                message: 'Room updated successfully',
                data: updated,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async deleteRoom(req, res) {
        try {
            const creatorId = req.user.userId;
            const roomId = req.params.roomId;
            await room_service_1.roomService.deleteRoom(roomId, creatorId);
            res.status(200).json({
                status: 'Success',
                message: 'Room deleted successfully',
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
}
exports.RoomController = RoomController;
exports.roomController = new RoomController();
