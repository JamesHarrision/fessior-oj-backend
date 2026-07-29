"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const mongoose_1 = require("./config/mongoose");
const socket_1 = require("./sockets/socket");
const contest_cron_1 = require("./workers/contest.cron");
const PORT = process.env.PORT || 6868;
const startServer = async () => {
    await (0, mongoose_1.connectMongoDB)();
    const server = http_1.default.createServer(app_1.default);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    (0, socket_1.initSocket)(io);
    (0, contest_cron_1.startContestCron)();
    server.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);
    });
};
startServer();
