import { Request, Response } from 'express';
export declare class FriendshipController {
    sendRequest(req: Request, res: Response): Promise<void>;
    acceptRequest(req: Request, res: Response): Promise<void>;
    declineRequest(req: Request, res: Response): Promise<void>;
    removeFriendship(req: Request, res: Response): Promise<void>;
    getFriends(req: Request, res: Response): Promise<void>;
    getPendingRequests(req: Request, res: Response): Promise<void>;
}
export declare const friendshipController: FriendshipController;
