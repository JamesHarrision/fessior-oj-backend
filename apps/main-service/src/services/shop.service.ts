import { shopRepository } from '../repositories/shop.repository';
import { prisma } from '../config/prisma';

export class ShopService {
  async createShopItem(data: {
    name: string;
    description?: string;
    price: number;
    itemType: string;
    assetUrl: string;
  }) {
    return shopRepository.createItem(data);
  }

  async getShopItems() {
    return shopRepository.getItems();
  }

  async buyItem(userId: string, itemId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    const item = await shopRepository.getItemById(itemId);
    if (!item) {
      throw new Error('Item not found in shop');
    }

    if (user.code_coins < item.price) {
      throw new Error('Insufficient coins');
    }

    const alreadyOwned = await shopRepository.getInventoryItemByItem(userId, itemId);
    if (alreadyOwned) {
      throw new Error('You already own this item');
    }

    return shopRepository.buyItem(userId, itemId, item.price);
  }

  async getInventory(userId: string) {
    return shopRepository.getInventory(userId);
  }

  async equipOrUnequip(userId: string, inventoryItemId: string, equip: boolean) {
    const invItem = await shopRepository.getInventoryItemById(inventoryItemId);
    if (!invItem || invItem.user_id !== userId) {
      throw new Error('Inventory item not found');
    }

    if (equip) {
      return shopRepository.equipItem(userId, inventoryItemId, invItem.item.item_type);
    } else {
      return shopRepository.unequipItem(inventoryItemId);
    }
  }
}

export const shopService = new ShopService();
