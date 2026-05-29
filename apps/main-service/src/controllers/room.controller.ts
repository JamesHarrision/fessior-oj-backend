import { Request, Response } from 'express';
import { roomService } from '../services/room.service';

export class RoomController {
  async createRoom(req: Request, res: Response) {
    try {
      const creatorId = req.user.userId;
      const room = await roomService.createRoom(creatorId, req.body);
      res.status(201).json({
        success: true,
        data: room,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getActiveRooms(req: Request, res: Response) {
    try {
      const rooms = await roomService.getActiveRooms();
      res.status(200).json({
        success: true,
        data: rooms,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getRoomDetails(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const room = await roomService.getRoomDetails(roomId);
      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async joinRoom(req: Request, res: Response) {
    try {
      const opponentId = req.user.userId;
      const { roomCode } = req.body;
      const result = await roomService.joinRoom(roomCode, opponentId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async leaveRoom(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.body;
      const result = await roomService.leaveRoom(roomId, userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateRoomConfig(req: Request, res: Response) {
    try {
      const creatorId = req.user.userId;
      const { roomId } = req.params;
      const updated = await roomService.updateRoomConfig(roomId, creatorId, req.body);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteRoom(req: Request, res: Response) {
    try {
      const creatorId = req.user.userId;
      const { roomId } = req.params;
      const result = await roomService.deleteRoom(roomId, creatorId);
      res.status(200).json({
        success: true,
        message: 'Room deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const roomController = new RoomController();
