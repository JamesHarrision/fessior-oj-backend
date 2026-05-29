import { prisma } from '../config/prisma';

export class CommentRepository {
  async create(data: {
    targetId: string;
    targetType: string;
    userId: string;
    content: string;
    parentId?: string;
  }) {
    return prisma.comment.create({
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

  async findList(targetId: string, targetType: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, items] = await prisma.$transaction([
      prisma.comment.count({
        where: {
          target_id: targetId,
          target_type: targetType,
          parent_id: null, // load top level comments first
        },
      }),
      prisma.comment.findMany({
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

  async findById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        likes: true,
      },
    });
  }

  async update(id: string, content: string) {
    return prisma.comment.update({
      where: { id },
      data: { content },
    });
  }

  async delete(id: string) {
    return prisma.comment.delete({
      where: { id },
    });
  }

  async toggleLike(commentId: string, userId: string) {
    const existing = await prisma.commentLike.findUnique({
      where: {
        comment_id_user_id: {
          comment_id: commentId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      await prisma.commentLike.delete({
        where: {
          comment_id_user_id: {
            comment_id: commentId,
            user_id: userId,
          },
        },
      });
      return { liked: false };
    } else {
      await prisma.commentLike.create({
        data: {
          comment_id: commentId,
          user_id: userId,
        },
      });
      return { liked: true };
    }
  }
}

export const commentRepository = new CommentRepository();
