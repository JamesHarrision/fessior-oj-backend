import { Request, Response, NextFunction } from 'express';
export declare const chatController: {
    getSessions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    sendMessage: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
};
