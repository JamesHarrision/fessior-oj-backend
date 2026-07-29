import { API_ROUTES } from '@ocj/constants';
export class ShopRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getItems() {
        return this.http.request('GET', `${API_ROUTES.SHOP}/items`);
    }
    purchaseItem(itemId) {
        return this.http.request('POST', `${API_ROUTES.SHOP}/purchase`, { body: { itemId } });
    }
    getInventory() {
        return this.http.request('GET', `${API_ROUTES.SHOP}/inventory`);
    }
    equipItem(itemId) {
        return this.http.request('POST', `${API_ROUTES.SHOP}/equip`, { body: { itemId } });
    }
    unequipItem(itemId) {
        return this.http.request('POST', `${API_ROUTES.SHOP}/unequip`, { body: { itemId } });
    }
}
