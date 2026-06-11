import { Router } from 'express';
import { shopController } from '../controllers/shop.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createShopItemSchema, buyItemSchema, equipItemSchema } from '../validators/shop.validator';

const router = Router();

// Public route to view shop items
// Public route to view shop items
router.get('/',
	/* #swagger.tags = ['Shop']
		 #swagger.summary = 'List shop items'
	*/
	shopController.getShopItems);

// Admin-only route to add shop items
// Admin-only route to add shop items
router.post('/',
	/* #swagger.tags = ['Shop']
		 #swagger.summary = 'Create shop item (admin)'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateShopItem' } } } }
	*/
	requireAuth, requireAdmin, validateRequest(createShopItemSchema), shopController.createShopItem);

// User auth-required routes
// User auth-required routes
router.post('/buy',
	/* #swagger.tags = ['Shop']
		 #swagger.summary = 'Buy an item from shop'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BuyItem' } } } }
	*/
	requireAuth, validateRequest(buyItemSchema), shopController.buyItem);

router.get('/inventory',
	/* #swagger.tags = ['Shop']
		 #swagger.summary = 'Get user inventory'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	requireAuth, shopController.getInventory);

router.post('/equip',
	/* #swagger.tags = ['Shop']
		 #swagger.summary = 'Equip or unequip an item'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipItem' } } } }
	*/
	requireAuth, validateRequest(equipItemSchema), shopController.equipOrUnequip);

export default router;
