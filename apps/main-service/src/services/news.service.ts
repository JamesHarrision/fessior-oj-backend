import { newsRepository } from '../repositories/news.repository';

export class NewsService {
  async createNews(authorId: string, data: { title: string; content: string }) {
    if (!data.title || !data.content) {
      throw new Error('Title and content are required');
    }
    return newsRepository.create({
      title: data.title,
      content: data.content,
      authorId,
    });
  }

  async getNews(page = 1, limit = 10) {
    return newsRepository.findList(page, limit);
  }

  async deleteNews(id: string, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new Error('Only admins can delete news');
    }
    const news = await newsRepository.findById(id);
    if (!news) {
      throw new Error('News not found');
    }
    await newsRepository.delete(id);
    return { success: true };
  }
}

export const newsService = new NewsService();
