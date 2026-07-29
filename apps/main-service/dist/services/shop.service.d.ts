export declare class ShopService {
    createShopItem(data: {
        name: string;
        description?: string;
        price: number;
        itemType: string;
        assetUrl: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        price: number;
        item_type: string;
        asset_url: string;
    }>;
    getShopItems(): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        price: number;
        item_type: string;
        asset_url: string;
    }[]>;
    buyItem(userId: string, itemId: string): Promise<{
        item: {
            id: string;
            created_at: Date;
            updated_at: Date;
            name: string;
            description: string | null;
            price: number;
            item_type: string;
            asset_url: string;
        };
    } & {
        id: string;
        user_id: string;
        is_equipped: boolean;
        acquired_at: Date;
        item_id: string;
    }>;
    getInventory(userId: string): Promise<({
        item: {
            id: string;
            created_at: Date;
            updated_at: Date;
            name: string;
            description: string | null;
            price: number;
            item_type: string;
            asset_url: string;
        };
    } & {
        id: string;
        user_id: string;
        is_equipped: boolean;
        acquired_at: Date;
        item_id: string;
    })[]>;
    equipOrUnequip(userId: string, inventoryItemId: string, equip: boolean): Promise<{
        item: {
            id: string;
            created_at: Date;
            updated_at: Date;
            name: string;
            description: string | null;
            price: number;
            item_type: string;
            asset_url: string;
        };
    } & {
        id: string;
        user_id: string;
        is_equipped: boolean;
        acquired_at: Date;
        item_id: string;
    }>;
}
export declare const shopService: ShopService;
