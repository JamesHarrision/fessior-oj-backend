"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const comment_repository_1 = require("../repositories/comment.repository");
const prisma_1 = require("../config/prisma");
class CommentService {
    async createComment(userId, data) {
        let finalParentId = data.parentId;
        if (data.parentId) {
            const parent = await comment_repository_1.commentRepository.findById(data.parentId);
            if (!parent) {
                throw new Error('Parent comment not found');
            }
            // If the parent comment is itself a reply, make this comment a reply to the top-level parent
            if (parent.parent_id) {
                finalParentId = parent.parent_id;
            }
        }
        return comment_repository_1.commentRepository.create({
            targetId: data.targetId,
            targetType: data.targetType,
            userId,
            content: data.content,
            parentId: finalParentId,
        });
    }
    async getComments(targetId, targetType, page = 1, limit = 10) {
        const result = await comment_repository_1.commentRepository.findList(targetId, targetType, page, limit);
        // Collect all user IDs from comments and replies
        const userIds = new Set();
        result.items.forEach((c) => {
            userIds.add(c.user_id);
            c.replies.forEach((r) => userIds.add(r.user_id));
        });
        // Fetch user details for all involved users
        const users = await prisma_1.prisma.user.findMany({
            where: { id: { in: Array.from(userIds) } },
            select: { id: true, username: true, elo_rating: true, avatar_url: true },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        // Map user details into comments and replies
        const enrichedItems = result.items.map((comment) => {
            const enrichedReplies = comment.replies.map((reply) => ({
                ...reply,
                user: userMap.get(reply.user_id) || null,
                likeCount: reply.likes.length,
            }));
            return {
                ...comment,
                user: userMap.get(comment.user_id) || null,
                likeCount: comment.likes.length,
                replies: enrichedReplies,
            };
        });
        return {
            ...result,
            items: enrichedItems,
        };
    }
    async updateComment(commentId, userId, content) {
        const comment = await comment_repository_1.commentRepository.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }
        if (comment.user_id !== userId) {
            throw new Error('You do not have permission to edit this comment');
        }
        return comment_repository_1.commentRepository.update(commentId, content);
    }
    async deleteComment(commentId, userId, userRole) {
        const comment = await comment_repository_1.commentRepository.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }
        if (comment.user_id !== userId && userRole !== 'ADMIN') {
            throw new Error('You do not have permission to delete this comment');
        }
        await comment_repository_1.commentRepository.delete(commentId);
        return { success: true };
    }
    async toggleLike(commentId, userId) {
        const comment = await comment_repository_1.commentRepository.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }
        return comment_repository_1.commentRepository.toggleLike(commentId, userId);
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
