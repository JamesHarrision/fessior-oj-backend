export declare class ShopRepository {
    createItem(data: {
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
    getItems(): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        price: number;
        item_type: string;
        asset_url: string;
    }[]>;
    getItemById(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        price: number;
        item_type: string;
        asset_url: string;
    }>;
    buyItem(userId: string, itemId: string, price: number): Promise<{
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
    getInventoryItemById(id: string): Promise<{
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
    getInventoryItemByItem(userId: string, itemId: string): Promise<{
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
    equipItem(userId: string, inventoryItemId: string, itemType: string): Promise<{
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
    unequipItem(inventoryItemId: string): Promise<{
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
export declare const shopRepository: ShopRepository;
