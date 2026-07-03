import { API_ROUTES } from '@ocj/constants';
import type { IShopItem, IInventoryItem } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';

export class ShopRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getItems(): Promise<ApiResponse<IShopItem[]>> {
    return this.http.request('GET', `${API_ROUTES.SHOP}/items`);
  }

  purchaseItem(itemId: string): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.SHOP}/purchase`, { body: { itemId } });
  }

  getInventory(): Promise<ApiResponse<IInventoryItem[]>> {
    return this.http.request('GET', `${API_ROUTES.SHOP}/inventory`);
  }

  equipItem(itemId: string): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.SHOP}/equip`, { body: { itemId } });
  }

  unequipItem(itemId: string): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.SHOP}/unequip`, { body: { itemId } });
  }
}
