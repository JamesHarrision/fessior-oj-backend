import { Router } from 'express';
import { shopController } from '../controllers/shop.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createShopItemSchema, buyItemSchema, equipItemSchema } from '../validators/shop.validator';

const router = Router();

// Public route to view shop items
router.get('/', shopController.getShopItems);

// Admin-only route to add shop items
router.post('/', requireAuth, requireAdmin, validateRequest(createShopItemSchema), shopController.createShopItem);

// User auth-required routes
router.post('/buy', requireAuth, validateRequest(buyItemSchema), shopController.buyItem);
router.get('/inventory', requireAuth, shopController.getInventory);
router.post('/equip', requireAuth, validateRequest(equipItemSchema), shopController.equipOrUnequip);

export default router;
