"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipItemSchema = exports.buyItemSchema = exports.createShopItemSchema = void 0;
const zod_1 = require("zod");
exports.createShopItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Name must be at least 3 characters'),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().int().nonnegative('Price must be a positive integer'),
    itemType: zod_1.z.string().min(2, 'Item type must be specified'),
    assetUrl: zod_1.z.string().url('Invalid asset URL'),
});
exports.buyItemSchema = zod_1.z.object({
    itemId: zod_1.z.string().uuid('Invalid item ID format'),
});
exports.equipItemSchema = zod_1.z.object({
    inventoryItemId: zod_1.z.string().uuid('Invalid inventory item ID format'),
    equip: zod_1.z.boolean(),
});
