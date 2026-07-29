"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopController = exports.ShopController = void 0;
const shop_service_1 = require("../services/shop.service");
class ShopController {
    async createShopItem(req, res) {
        try {
            const item = await shop_service_1.shopService.createShopItem(req.body);
            res.status(201).json({
                success: true,
                data: item,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getShopItems(req, res) {
        try {
            const items = await shop_service_1.shopService.getShopItems();
            res.status(200).json({
                success: true,
                data: items,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async buyItem(req, res) {
        try {
            const userId = req.user.userId;
            const { itemId } = req.body;
            const bought = await shop_service_1.shopService.buyItem(userId, itemId);
            res.status(200).json({
                success: true,
                data: bought,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getInventory(req, res) {
        try {
            const userId = req.user.userId;
            const inventory = await shop_service_1.shopService.getInventory(userId);
            res.status(200).json({
                success: true,
                data: inventory,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async equipOrUnequip(req, res) {
        try {
            const userId = req.user.userId;
            const { inventoryItemId, equip } = req.body;
            const updated = await shop_service_1.shopService.equipOrUnequip(userId, inventoryItemId, equip);
            res.status(200).json({
                success: true,
                data: updated,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.ShopController = ShopController;
exports.shopController = new ShopController();
