import { Request, Response } from 'express';
import { shopService } from '../services/shop.service';

export class ShopController {
  async createShopItem(req: Request, res: Response) {
    try {
      const item = await shopService.createShopItem(req.body);
      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getShopItems(req: Request, res: Response) {
    try {
      const items = await shopService.getShopItems();
      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async buyItem(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { itemId } = req.body;
      const bought = await shopService.buyItem(userId, itemId);
      res.status(200).json({
        success: true,
        data: bought,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getInventory(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const inventory = await shopService.getInventory(userId);
      res.status(200).json({
        success: true,
        data: inventory,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async equipOrUnequip(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { inventoryItemId, equip } = req.body;
      const updated = await shopService.equipOrUnequip(userId, inventoryItemId, equip);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const shopController = new ShopController();
