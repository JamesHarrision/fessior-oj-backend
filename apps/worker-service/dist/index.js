"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = require("./config/mongoose");
const submission_worker_1 = require("./workers/submission.worker");
const bootstrap = async () => {
    console.log('Starting Worker Service...');
    await (0, mongoose_1.connectMongoDB)();
    (0, submission_worker_1.startSubmissionWorker)();
};
bootstrap().catch((err) => {
    console.error('Fatal error starting Worker Service:', err);
    process.exit(1);
});
