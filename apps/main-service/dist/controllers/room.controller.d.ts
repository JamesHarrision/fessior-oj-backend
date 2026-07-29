import { Request, Response } from 'express';
export declare class RoomController {
    createRoom(req: Request, res: Response): Promise<void>;
    getCurrentRoom(req: Request, res: Response): Promise<void>;
    getActiveRooms(req: Request, res: Response): Promise<void>;
    getRoomDetails(req: Request, res: Response): Promise<void>;
    joinRoom(req: Request, res: Response): Promise<void>;
    leaveRoom(req: Request, res: Response): Promise<void>;
    kickPlayer(req: Request, res: Response): Promise<void>;
    startMatch(req: Request, res: Response): Promise<void>;
    updateRoomConfig(req: Request, res: Response): Promise<void>;
    deleteRoom(req: Request, res: Response): Promise<void>;
}
export declare const roomController: RoomController;
