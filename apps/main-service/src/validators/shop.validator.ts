import { z } from 'zod';

export const createShopItemSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.number().int().nonnegative('Price must be a positive integer'),
  itemType: z.string().min(2, 'Item type must be specified'),
  assetUrl: z.string().url('Invalid asset URL'),
});

export const buyItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID format'),
});

export const equipItemSchema = z.object({
  inventoryItemId: z.string().uuid('Invalid inventory item ID format'),
  equip: z.boolean(),
});
