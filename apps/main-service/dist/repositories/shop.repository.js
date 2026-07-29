"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopRepository = exports.ShopRepository = void 0;
const prisma_1 = require("../config/prisma");
class ShopRepository {
    async createItem(data) {
        return prisma_1.prisma.shopItem.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                item_type: data.itemType,
                asset_url: data.assetUrl,
            },
        });
    }
    async getItems() {
        return prisma_1.prisma.shopItem.findMany({
            orderBy: { price: 'asc' },
        });
    }
    async getItemById(id) {
        return prisma_1.prisma.shopItem.findUnique({
            where: { id },
        });
    }
    async buyItem(userId, itemId, price) {
        return prisma_1.prisma.$transaction(async (tx) => {
            // Deduct coins
            await tx.user.update({
                where: { id: userId },
                data: {
                    code_coins: {
                        decrement: price,
                    },
                },
            });
            // Add to inventory
            return tx.inventoryItem.create({
                data: {
                    user_id: userId,
                    item_id: itemId,
                    is_equipped: false,
                },
                include: {
                    item: true,
                },
            });
        });
    }
    async getInventory(userId) {
        return prisma_1.prisma.inventoryItem.findMany({
            where: { user_id: userId },
            include: {
                item: true,
            },
        });
    }
    async getInventoryItemById(id) {
        return prisma_1.prisma.inventoryItem.findUnique({
            where: { id },
            include: {
                item: true,
            },
        });
    }
    async getInventoryItemByItem(userId, itemId) {
        return prisma_1.prisma.inventoryItem.findUnique({
            where: {
                user_id_item_id: {
                    user_id: userId,
                    item_id: itemId,
                },
            },
            include: {
                item: true,
            },
        });
    }
    async equipItem(userId, inventoryItemId, itemType) {
        return prisma_1.prisma.$transaction(async (tx) => {
            // 1. Unequip all items of the same type for this user
            // Find all inventory items of this user that have the same itemType
            const userItemsOfType = await tx.inventoryItem.findMany({
                where: {
                    user_id: userId,
                    item: {
                        item_type: itemType,
                    },
                },
            });
            const itemIdsToUnequip = userItemsOfType.map((i) => i.id);
            if (itemIdsToUnequip.length > 0) {
                await tx.inventoryItem.updateMany({
                    where: {
                        id: { in: itemIdsToUnequip },
                    },
                    data: {
                        is_equipped: false,
                    },
                });
            }
            // 2. Equip the chosen one
            return tx.inventoryItem.update({
                where: { id: inventoryItemId },
                data: {
                    is_equipped: true,
                },
                include: {
                    item: true,
                },
            });
        });
    }
    async unequipItem(inventoryItemId) {
        return prisma_1.prisma.inventoryItem.update({
            where: { id: inventoryItemId },
            data: {
                is_equipped: false,
            },
            include: {
                item: true,
            },
        });
    }
}
exports.ShopRepository = ShopRepository;
exports.shopRepository = new ShopRepository();
