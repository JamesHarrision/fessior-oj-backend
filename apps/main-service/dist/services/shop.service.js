"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopService = exports.ShopService = void 0;
const shop_repository_1 = require("../repositories/shop.repository");
const prisma_1 = require("../config/prisma");
class ShopService {
    async createShopItem(data) {
        return shop_repository_1.shopRepository.createItem(data);
    }
    async getShopItems() {
        return shop_repository_1.shopRepository.getItems();
    }
    async buyItem(userId, itemId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const item = await shop_repository_1.shopRepository.getItemById(itemId);
        if (!item) {
            throw new Error('Item not found in shop');
        }
        if (user.code_coins < item.price) {
            throw new Error('Insufficient coins');
        }
        const alreadyOwned = await shop_repository_1.shopRepository.getInventoryItemByItem(userId, itemId);
        if (alreadyOwned) {
            throw new Error('You already own this item');
        }
        return shop_repository_1.shopRepository.buyItem(userId, itemId, item.price);
    }
    async getInventory(userId) {
        return shop_repository_1.shopRepository.getInventory(userId);
    }
    async equipOrUnequip(userId, inventoryItemId, equip) {
        const invItem = await shop_repository_1.shopRepository.getInventoryItemById(inventoryItemId);
        if (!invItem || invItem.user_id !== userId) {
            throw new Error('Inventory item not found');
        }
        if (equip) {
            return shop_repository_1.shopRepository.equipItem(userId, inventoryItemId, invItem.item.item_type);
        }
        else {
            return shop_repository_1.shopRepository.unequipItem(inventoryItemId);
        }
    }
}
exports.ShopService = ShopService;
exports.shopService = new ShopService();
