import type { IShopItem, IInventoryItem } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class ShopRepository {
    private readonly http;
    constructor(http: HttpClient);
    getItems(): Promise<ApiResponse<IShopItem[]>>;
    purchaseItem(itemId: string): Promise<ApiResponse<void>>;
    getInventory(): Promise<ApiResponse<IInventoryItem[]>>;
    equipItem(itemId: string): Promise<ApiResponse<void>>;
    unequipItem(itemId: string): Promise<ApiResponse<void>>;
}
