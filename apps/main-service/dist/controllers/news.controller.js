"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsController = exports.NewsController = void 0;
const news_service_1 = require("../services/news.service");
class NewsController {
    async createNews(req, res) {
        try {
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({ success: false, message: 'Only admins can post news' });
            }
            const userId = req.user.userId;
            const news = await news_service_1.newsService.createNews(userId, req.body);
            res.status(201).json({
                success: true,
                data: news,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getNews(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const news = await news_service_1.newsService.getNews(page, limit);
            res.status(200).json({
                success: true,
                data: news,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async deleteNews(req, res) {
        try {
            const userRole = req.user.role;
            const newsId = req.params.newsId;
            await news_service_1.newsService.deleteNews(newsId, userRole);
            res.status(200).json({
                success: true,
                message: 'News deleted successfully',
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.NewsController = NewsController;
exports.newsController = new NewsController();
