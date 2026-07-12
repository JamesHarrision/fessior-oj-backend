import { prisma } from '../config/prisma';

export class NewsRepository {
  async create(data: { title: string; content: string; authorId: string }) {
    return prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        author_id: data.authorId,
      },
      include: {
        author: {
          select: { id: true, username: true, avatar_url: true },
        },
      },
    });
  }

  async findList(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, items] = await prisma.$transaction([
      prisma.news.count(),
      prisma.news.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, avatar_url: true, role: true },
          },
        },
      }),
    ]);

    return { total, page, limit, items };
  }

  async findById(id: string) {
    return prisma.news.findUnique({
      where: { id },
    });
  }

  async delete(id: string) {
    return prisma.news.delete({
      where: { id },
    });
  }
}

export const newsRepository = new NewsRepository();
