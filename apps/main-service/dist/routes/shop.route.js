"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shop_controller_1 = require("../controllers/shop.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const shop_validator_1 = require("../validators/shop.validator");
const router = (0, express_1.Router)();
// Public route to view shop items
router.get('/', 
/* #swagger.tags = ['Shop']
   #swagger.summary = 'List shop items'
   #swagger.description = 'Get available shop items. Supports pagination and optional search/filtering.'
   #swagger.parameters['page'] = {
     in: 'query',
     schema: {
       type: 'integer',
       default: 1
     }
   }
   #swagger.parameters['limit'] = {
     in: 'query',
     schema: {
       type: 'integer',
       default: 20
     }
   }
   #swagger.parameters['search'] = {
     in: 'query',
     schema: {
       type: 'string'
     },
     description: 'Search by name or tags'
   }
   #swagger.parameters['category'] = {
     in: 'query',
     schema: {
       type: 'string'
     },
     description: 'Filter by category'
   }
   #swagger.responses[200] = {
     description: 'List of shop items',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Shop items fetched',
           data: {
             items: [
               {
                 itemId: 'i_1',
                 name: 'Starter Badge',
                 price: 100,
                 stock: 50,
                 category: 'badge'
               }
             ],
             total: 1,
             page: 1,
             limit: 20
           }
         }
       }
     }
   }
*/
shop_controller_1.shopController.getShopItems);
// Admin-only route to add shop items
router.post('/', 
/* #swagger.tags = ['Shop']
   #swagger.summary = 'Create shop item (admin)'
   #swagger.description = 'Create a new item in the shop. Admins only.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = {
     required: true,
     content: {
       'application/json': {
         schema: {
           type: 'object',
           properties: {
             name: { type: 'string' },
             description: { type: 'string' },
             price: { type: 'integer' },
             stock: { type: 'integer' },
             category: { type: 'string' },
             metadata: { type: 'object' }
           },
           required: ['name', 'price']
         },
         example: {
           name: 'Starter Badge',
           description: 'Awarded for first 10 solves',
           price: 100,
           stock: 100,
           category: 'badge',
           metadata: {
             rarity: 'common'
           }
         }
       }
     }
   }
   #swagger.responses[201] = {
     description: 'Shop item created',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Item created',
           data: {
             itemId: 'i_1',
             name: 'Starter Badge',
             price: 100
           }
         }
       }
     }
   }
*/
auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, validate_middleware_1.validateRequest)(shop_validator_1.createShopItemSchema), shop_controller_1.shopController.createShopItem);
// User auth-required routes
router.post('/buy', 
/* #swagger.tags = ['Shop']
   #swagger.summary = 'Buy an item from shop'
   #swagger.description = 'Purchase an item using user balance. Requires authentication.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = {
     required: true,
     content: {
       'application/json': {
         schema: {
           type: 'object',
           properties: {
             itemId: { type: 'string' },
             quantity: {
               type: 'integer',
               default: 1
             }
           },
           required: ['itemId']
         },
         example: {
           itemId: 'i_1',
           quantity: 1
         }
       }
     }
   }
   #swagger.responses[200] = {
     description: 'Purchase successful',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Purchase completed',
           data: {
             purchaseId: 'p_1',
             itemId: 'i_1',
             quantity: 1,
             remainingBalance: 900
           }
         }
       }
     }
   }
   #swagger.responses[400] = {
     description: 'Insufficient funds or invalid request',
     content: {
       'application/json': {
         example: {
           status: 'Error',
           message: 'Insufficient balance'
         }
       }
     }
   }
*/
auth_middleware_1.requireAuth, (0, validate_middleware_1.validateRequest)(shop_validator_1.buyItemSchema), shop_controller_1.shopController.buyItem);
router.get('/inventory', 
/* #swagger.tags = ['Shop']
   #swagger.summary = 'Get user inventory'
   #swagger.description = 'Return items owned by the authenticated user.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.responses[200] = {
     description: 'User inventory',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Inventory fetched',
           data: {
             items: [
               {
                 itemId: 'i_1',
                 name: 'Starter Badge',
                 equipped: true,
                 quantity: 1
               }
             ]
           }
         }
       }
     }
   }
*/
auth_middleware_1.requireAuth, shop_controller_1.shopController.getInventory);
router.post('/equip', 
/* #swagger.tags = ['Shop']
   #swagger.summary = 'Equip or unequip an item'
   #swagger.description = 'Equip or unequip an owned item. Requires authentication.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = {
     required: true,
     content: {
       'application/json': {
         schema: {
           type: 'object',
           properties: {
             itemId: { type: 'string' },
             action: {
               type: 'string',
               enum: ['equip', 'unequip']
             }
           },
           required: ['itemId', 'action']
         },
         example: {
           itemId: 'i_1',
           action: 'equip'
         }
       }
     }
   }
   #swagger.responses[200] = {
     description: 'Equip/Unequip result',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Item equipped',
           data: {
             itemId: 'i_1',
             equipped: true
           }
         }
       }
     }
   }
   #swagger.responses[400] = {
     description: 'Invalid request',
     content: {
       'application/json': {
         example: {
           status: 'Error',
           message: 'Item not owned'
         }
       }
     }
   }
*/
auth_middleware_1.requireAuth, (0, validate_middleware_1.validateRequest)(shop_validator_1.equipItemSchema), shop_controller_1.shopController.equipOrUnequip);
exports.default = router;
