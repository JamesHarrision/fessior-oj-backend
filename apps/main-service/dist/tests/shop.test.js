"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../config/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
describe('Shop & Inventory Integration Tests', () => {
    let adminToken;
    let userToken;
    let userId;
    let itemId;
    let inventoryItemId;
    beforeAll(async () => {
        // 1. Clean up database
        await prisma_1.prisma.inventoryItem.deleteMany({});
        await prisma_1.prisma.shopItem.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
        // 2. Create users
        const hashedPwd = await bcrypt_1.default.hash('password123', 10);
        const admin = await prisma_1.prisma.user.create({
            data: {
                username: 'shop_admin',
                email: 'admin@shop.com',
                password_hash: hashedPwd,
                role: 'ADMIN',
            },
        });
        const user = await prisma_1.prisma.user.create({
            data: {
                username: 'shop_buyer',
                email: 'buyer@shop.com',
                password_hash: hashedPwd,
                role: 'USER',
                code_coins: 500, // Give them 500 coins to buy items
            },
        });
        userId = user.id;
        // 3. Login
        const adminLogin = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'admin@shop.com', password: 'password123' });
        adminToken = adminLogin.body.data?.accessToken;
        const userLogin = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'buyer@shop.com', password: 'password123' });
        userToken = userLogin.body.data?.accessToken;
    });
    afterAll(async () => {
        await prisma_1.prisma.inventoryItem.deleteMany({});
        await prisma_1.prisma.shopItem.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
    });
    it('should allow admin to create a new shop item', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/shop')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            name: 'Golden Frame',
            description: 'A beautiful shiny golden frame for your avatar.',
            price: 150,
            itemType: 'AVATAR_FRAME',
            assetUrl: 'http://example.com/assets/golden-frame.png',
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.name).toBe('Golden Frame');
        expect(res.body.data.price).toBe(150);
        itemId = res.body.data.id;
    });
    it('should retrieve list of shop items', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/shop');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].id).toBe(itemId);
    });
    it('should allow user to buy a shop item and deduct coins', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/shop/buy')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            itemId,
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.item_id).toBe(itemId);
        expect(res.body.data.is_equipped).toBe(false);
        inventoryItemId = res.body.data.id;
        // Check user coins balance has decreased
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        expect(user?.code_coins).toBe(350); // 500 - 150 = 350
    });
    it('should list items in user inventory', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/shop/inventory')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].id).toBe(inventoryItemId);
        expect(res.body.data[0].item.name).toBe('Golden Frame');
    });
    it('should allow user to equip the inventory item', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/shop/equip')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            inventoryItemId,
            equip: true,
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.is_equipped).toBe(true);
    });
    it('should allow user to unequip the inventory item', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/shop/equip')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            inventoryItemId,
            equip: false,
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.is_equipped).toBe(false);
    });
});
