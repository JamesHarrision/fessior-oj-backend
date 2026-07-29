"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRepository = exports.CommentRepository = void 0;
const prisma_1 = require("../config/prisma");
class CommentRepository {
    async create(data) {
        return prisma_1.prisma.comment.create({
            data: {
                target_id: data.targetId,
                target_type: data.targetType,
                user_id: data.userId,
                content: data.content,
                parent_id: data.parentId || null,
            },
            include: {
                parent: true,
            },
        });
    }
    async findList(targetId, targetType, page, limit) {
        const skip = (page - 1) * limit;
        const [total, items] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.comment.count({
                where: {
                    target_id: targetId,
                    target_type: targetType,
                    parent_id: null, // load top level comments first
                },
            }),
            prisma_1.prisma.comment.findMany({
                where: {
                    target_id: targetId,
                    target_type: targetType,
                    parent_id: null,
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    likes: {
                        select: {
                            user_id: true,
                        },
                    },
                    replies: {
                        include: {
                            likes: {
                                select: {
                                    user_id: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);
        return {
            total,
            page,
            limit,
            items,
        };
    }
    async findById(id) {
        return prisma_1.prisma.comment.findUnique({
            where: { id },
            include: {
                likes: true,
            },
        });
    }
    async update(id, content) {
        return prisma_1.prisma.comment.update({
            where: { id },
            data: { content },
        });
    }
    async delete(id) {
        return prisma_1.prisma.comment.delete({
            where: { id },
        });
    }
    async toggleLike(commentId, userId) {
        const existing = await prisma_1.prisma.commentLike.findUnique({
            where: {
                comment_id_user_id: {
                    comment_id: commentId,
                    user_id: userId,
                },
            },
        });
        if (existing) {
            await prisma_1.prisma.commentLike.delete({
                where: {
                    comment_id_user_id: {
                        comment_id: commentId,
                        user_id: userId,
                    },
                },
            });
            return { liked: false };
        }
        else {
            await prisma_1.prisma.commentLike.create({
                data: {
                    comment_id: commentId,
                    user_id: userId,
                },
            });
            return { liked: true };
        }
    }
}
exports.CommentRepository = CommentRepository;
exports.commentRepository = new CommentRepository();
