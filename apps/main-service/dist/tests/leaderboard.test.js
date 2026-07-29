"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../config/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
describe('Leaderboard Integration Tests', () => {
    beforeAll(async () => {
        await prisma_1.prisma.user.deleteMany({});
        // Seed some users with different ELOs
        const pwd = await bcrypt_1.default.hash('password123', 10);
        await prisma_1.prisma.user.createMany({
            data: [
                { username: 'top1_coder', email: 'top1@test.com', password_hash: pwd, elo_rating: 1500 },
                { username: 'top2_coder', email: 'top2@test.com', password_hash: pwd, elo_rating: 1300 },
                { username: 'top3_coder', email: 'top3@test.com', password_hash: pwd, elo_rating: 1100 },
            ],
        });
    });
    afterAll(async () => {
        await prisma_1.prisma.user.deleteMany({});
    });
    it('should fetch leaderboard list sorted by ELO', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/leaderboard');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.data.items.length).toBe(3);
        expect(res.body.data.items[0].username).toBe('top1_coder');
        expect(res.body.data.items[1].username).toBe('top2_coder');
    });
});
