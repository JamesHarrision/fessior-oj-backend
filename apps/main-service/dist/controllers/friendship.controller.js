"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendshipController = exports.FriendshipController = void 0;
const friendship_service_1 = require("../services/friendship.service");
class FriendshipController {
    async sendRequest(req, res) {
        try {
            const senderId = req.user.userId;
            const { receiverId } = req.body;
            const request = await friendship_service_1.friendshipService.sendRequest(senderId, receiverId);
            res.status(201).json({
                success: true,
                data: request,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async acceptRequest(req, res) {
        try {
            const userId = req.user.userId;
            const { senderId } = req.body;
            const request = await friendship_service_1.friendshipService.acceptRequest(userId, senderId);
            res.status(200).json({
                success: true,
                data: request,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async declineRequest(req, res) {
        try {
            const userId = req.user.userId;
            const { senderId } = req.body;
            await friendship_service_1.friendshipService.declineRequest(userId, senderId);
            res.status(200).json({
                success: true,
                message: 'Friend request declined',
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async removeFriendship(req, res) {
        try {
            const userId = req.user.userId;
            const friendId = req.params.friendId;
            await friendship_service_1.friendshipService.removeFriendship(userId, friendId);
            res.status(200).json({
                success: true,
                message: 'Friend removed successfully',
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getFriends(req, res) {
        try {
            const userId = req.user.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const friends = await friendship_service_1.friendshipService.getFriends(userId, page, limit);
            res.status(200).json({
                success: true,
                data: friends,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getPendingRequests(req, res) {
        try {
            const userId = req.user.userId;
            const requests = await friendship_service_1.friendshipService.getPendingRequests(userId);
            res.status(200).json({
                success: true,
                data: requests,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.FriendshipController = FriendshipController;
exports.friendshipController = new FriendshipController();
