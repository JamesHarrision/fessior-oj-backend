import { Request, Response } from 'express';
export declare class CommentController {
    createComment(req: Request, res: Response): Promise<void>;
    getComments(req: Request, res: Response): Promise<void>;
    updateComment(req: Request, res: Response): Promise<void>;
    deleteComment(req: Request, res: Response): Promise<void>;
    toggleLike(req: Request, res: Response): Promise<void>;
}
export declare const commentController: CommentController;
