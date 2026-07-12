import { Request, Response } from 'express';
import { roomService } from '../services/room.service';

export class RoomController {
  async createRoom(req: Request, res: Response) {
    try {
      const creatorId = (req as any).user.userId;
      const room = await roomService.createRoom(creatorId, req.body);
      res.status(201).json({
        status: 'Success',
        message: 'Room created successfully',
        data: room,
      });
    } catch (error: any) {
      res.status(400).json({ status: 'Error', message: error.message });
    }
  }

  async getCurrentRoom(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const room = await roomService.getCurrentRoom(userId);
      res.status(200).json({
        status: 'Success',
        message: 'Current room fetched successfully',
        data: room,
      });
    } catch (error: any) {
      res.status(400).json({ status: 'Error', message: error.message });
    }
  }

  async getActiveRooms(req: Request, res: Response) {
    try {
      const rooms = await roomService.getActiveRooms();
      res.status(200).json({
        status: 'Success',
        message: 'Active rooms fetched successfully',
        data: rooms,
      });
    } catch (error: any) {
      res.status(400).json({ status: 'Error', message: error.message });
    }
  }

  async getRoomDetails(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId as string;
      const room = await roomService.getRoomDetails(roomId);
      res.status(200).json({
        status: 'Success',
        message: 'Room details fetched successfully',
        data: room,
      });
    } catch (error: any) {
      res.status(404).json({ status: 'Error', message: error.message });
    }
  }

  async joinRoom(req: Request, res: Response) {
    try {
      const opponentId = (req as any).user.userId;
      const { roomCode } = req.body;
      const result = await roomService.joinRoom(roomCode, opponentId);
      res.status(200).json({
        status: 'Success',
        message: 'Success',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ status: 'Error', message: error.message });
    }
  }

  async leaveRoom(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { roomId } = req.body;
      const result = await roomService.leaveRoom(roomId, userId);
      res.status(200).json({
        status: 'Success',
        message: 'Success',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ status: 'Error', message: error.message });
    }
  }

  async kickPlayer(req: Request, res: Response) {
    try {
      const creatorId = (req as any).user.userId;
      const { roomId, opponentId } = req.body;
      const result = await roomService.kickPlayer(roomId, creatorId, opponentId);
      res.status(200).json({
        status: 'Success',
        message: 'Success',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ status: 'Error', message: error.message });
    }
  }

  async startMatch(req: Request, res: Response) {
    try {
      const creatorId = (req as any).user.userId;
      const { roomId } = req.body;
      const result = await roomService.startRoomMatch(roomId, creatorId);
      res.status(200).json({
        status: 'Success',
        message: 'Success',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ status: 'Error', message: error.message });
    }
  }

  async updateRoomConfig(req: Request, res: Response) {
    try {
      const creatorId = (req as any).user.userId;
      const roomId = req.params.roomId as string;
      const updated = await roomService.updateRoomConfig(roomId, creatorId, req.body);
      res.status(200).json({
        status: 'Success',
        message: 'Room updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({ status: 'Error', message: error.message });
    }
  }

  async deleteRoom(req: Request, res: Response) {
    try {
      const creatorId = (req as any).user.userId;
      const roomId = req.params.roomId as string;
      await roomService.deleteRoom(roomId, creatorId);
      res.status(200).json({
        status: 'Success',
        message: 'Room deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({ status: 'Error', message: error.message });
    }
  }
}

export const roomController = new RoomController();
