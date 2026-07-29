"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentController = exports.CommentController = void 0;
const comment_service_1 = require("../services/comment.service");
class CommentController {
    async createComment(req, res) {
        try {
            const userId = req.user.userId;
            const comment = await comment_service_1.commentService.createComment(userId, req.body);
            res.status(201).json({
                status: 'Success',
                message: 'Comment created successfully',
                data: comment,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async getComments(req, res) {
        try {
            const targetId = req.query.targetId;
            const targetType = req.query.targetType;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!targetId || !targetType) {
                throw new Error('targetId and targetType are required');
            }
            const comments = await comment_service_1.commentService.getComments(targetId, targetType, page, limit);
            res.status(200).json({
                status: 'Success',
                message: 'Comments retrieved successfully',
                data: comments,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async updateComment(req, res) {
        try {
            const userId = req.user.userId;
            const commentId = req.params.commentId;
            const { content } = req.body;
            const updated = await comment_service_1.commentService.updateComment(commentId, userId, content);
            res.status(200).json({
                status: 'Success',
                message: 'Comment updated successfully',
                data: updated,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async deleteComment(req, res) {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            const commentId = req.params.commentId;
            await comment_service_1.commentService.deleteComment(commentId, userId, userRole);
            res.status(200).json({
                status: 'Success',
                message: 'Comment deleted successfully',
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async toggleLike(req, res) {
        try {
            const userId = req.user.userId;
            const commentId = req.params.commentId;
            const result = await comment_service_1.commentService.toggleLike(commentId, userId);
            res.status(200).json({
                status: 'Success',
                message: 'Like toggled successfully',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
}
exports.CommentController = CommentController;
exports.commentController = new CommentController();
