"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsRepository = exports.NewsRepository = void 0;
const prisma_1 = require("../config/prisma");
class NewsRepository {
    async create(data) {
        return prisma_1.prisma.news.create({
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
    async findList(page, limit) {
        const skip = (page - 1) * limit;
        const [total, items] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.news.count(),
            prisma_1.prisma.news.findMany({
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
    async findById(id) {
        return prisma_1.prisma.news.findUnique({
            where: { id },
        });
    }
    async delete(id) {
        return prisma_1.prisma.news.delete({
            where: { id },
        });
    }
}
exports.NewsRepository = NewsRepository;
exports.newsRepository = new NewsRepository();
