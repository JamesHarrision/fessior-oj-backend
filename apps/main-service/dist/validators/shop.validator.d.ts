import { z } from 'zod';
export declare const createShopItemSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    itemType: z.ZodString;
    assetUrl: z.ZodString;
}, z.core.$strip>;
export declare const buyItemSchema: z.ZodObject<{
    itemId: z.ZodString;
}, z.core.$strip>;
export declare const equipItemSchema: z.ZodObject<{
    inventoryItemId: z.ZodString;
    equip: z.ZodBoolean;
}, z.core.$strip>;
