"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const prisma_1 = require("../config/prisma");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Tải .env của main-service
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// Tải thêm các key API từ .env.docker ở thư mục gốc nếu chưa được định nghĩa ở host
const dockerEnvPath = path_1.default.resolve(__dirname, '../../../../.env.docker');
if (fs_1.default.existsSync(dockerEnvPath)) {
    const dockerEnv = dotenv_1.default.parse(fs_1.default.readFileSync(dockerEnvPath));
    if (dockerEnv.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = dockerEnv.GEMINI_API_KEY;
    }
    if (dockerEnv.RAPIDAPI_KEY && !process.env.RAPIDAPI_KEY) {
        process.env.RAPIDAPI_KEY = dockerEnv.RAPIDAPI_KEY;
    }
    if (dockerEnv.RAPIDAPI_HOST && !process.env.RAPIDAPI_HOST) {
        process.env.RAPIDAPI_HOST = dockerEnv.RAPIDAPI_HOST;
    }
    if (dockerEnv.JUDGE0_URL && !process.env.JUDGE0_URL) {
        process.env.JUDGE0_URL = dockerEnv.JUDGE0_URL;
    }
}
// Nếu URL trỏ đến host.docker.internal (trong môi trường docker), chuyển thành localhost để chạy ở host
if (process.env.JUDGE0_URL === 'http://host.docker.internal:2358') {
    process.env.JUDGE0_URL = 'http://localhost:2358';
}
beforeAll(async () => {
    // Kết nối MongoDB nếu chưa kết nối
    const mongoUri = process.env.MONGO_URI || 'mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database_test?authSource=admin';
    if (mongoose_1.default.connection.readyState === 0) {
        await mongoose_1.default.connect(mongoUri);
    }
});
afterAll(async () => {
    // Đóng kết nối MongoDB
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.connection.close();
    }
    // Đóng kết nối Prisma
    await prisma_1.prisma.$disconnect();
});
