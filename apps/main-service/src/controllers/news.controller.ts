import { Request, Response } from 'express';
import { newsService } from '../services/news.service';

export class NewsController {
  async createNews(req: Request, res: Response) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Only admins can post news' });
      }
      const userId = req.user.userId;
      const news = await newsService.createNews(userId, req.body);
      res.status(201).json({
        success: true,
        data: news,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getNews(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const news = await newsService.getNews(page, limit);
      res.status(200).json({
        success: true,
        data: news,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteNews(req: Request, res: Response) {
    try {
      const userRole = req.user.role;
      const newsId = req.params.newsId as string;
      await newsService.deleteNews(newsId, userRole);
      res.status(200).json({
        success: true,
        message: 'News deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const newsController = new NewsController();
