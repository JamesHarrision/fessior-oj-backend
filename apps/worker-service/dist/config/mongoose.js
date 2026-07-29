"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectMongoDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin';
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log('MongoDB connected successfully inside worker-service');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
exports.connectMongoDB = connectMongoDB;
