import { Request, Response } from 'express';
import { friendshipService } from '../services/friendship.service';

export class FriendshipController {
  async sendRequest(req: Request, res: Response) {
    try {
      const senderId = req.user.userId;
      const { receiverId } = req.body;
      const request = await friendshipService.sendRequest(senderId, receiverId);
      res.status(201).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async acceptRequest(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { senderId } = req.body;
      const request = await friendshipService.acceptRequest(userId, senderId);
      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async declineRequest(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { senderId } = req.body;
      await friendshipService.declineRequest(userId, senderId);
      res.status(200).json({
        success: true,
        message: 'Friend request declined',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeFriendship(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { friendId } = req.params;
      await friendshipService.removeFriendship(userId, friendId as string);
      res.status(200).json({
        success: true,
        message: 'Friend removed successfully',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getFriends(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const friends = await friendshipService.getFriends(userId, page, limit);
      res.status(200).json({
        success: true,
        data: friends,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPendingRequests(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const requests = await friendshipService.getPendingRequests(userId);
      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const friendshipController = new FriendshipController();
