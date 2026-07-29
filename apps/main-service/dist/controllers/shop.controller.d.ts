import { Request, Response } from 'express';
export declare class ShopController {
    createShopItem(req: Request, res: Response): Promise<void>;
    getShopItems(req: Request, res: Response): Promise<void>;
    buyItem(req: Request, res: Response): Promise<void>;
    getInventory(req: Request, res: Response): Promise<void>;
    equipOrUnequip(req: Request, res: Response): Promise<void>;
}
export declare const shopController: ShopController;
