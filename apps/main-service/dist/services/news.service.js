"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsService = exports.NewsService = void 0;
const news_repository_1 = require("../repositories/news.repository");
class NewsService {
    async createNews(authorId, data) {
        if (!data.title || !data.content) {
            throw new Error('Title and content are required');
        }
        return news_repository_1.newsRepository.create({
            title: data.title,
            content: data.content,
            authorId,
        });
    }
    async getNews(page = 1, limit = 10) {
        return news_repository_1.newsRepository.findList(page, limit);
    }
    async deleteNews(id, userRole) {
        if (userRole !== 'ADMIN') {
            throw new Error('Only admins can delete news');
        }
        const news = await news_repository_1.newsRepository.findById(id);
        if (!news) {
            throw new Error('News not found');
        }
        await news_repository_1.newsRepository.delete(id);
        return { success: true };
    }
}
exports.NewsService = NewsService;
exports.newsService = new NewsService();
