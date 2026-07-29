import { Request, Response } from 'express';
export declare class NewsController {
    createNews(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getNews(req: Request, res: Response): Promise<void>;
    deleteNews(req: Request, res: Response): Promise<void>;
}
export declare const newsController: NewsController;
