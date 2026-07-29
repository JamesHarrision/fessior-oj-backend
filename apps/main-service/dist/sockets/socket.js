"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = exports.io = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const prisma_1 = require("../config/prisma");
const redis_1 = require("../config/redis");
const ioredis_1 = __importDefault(require("ioredis"));
const matchmaking_1 = require("./matchmaking");
const constants_1 = require("@ocj/constants");
exports.io = null;
// Initialize a separate Redis client for Pub/Sub subscription
const pubSubClient = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
});
const initSocket = (socketIoServer) => {
    exports.io = socketIoServer;
    // Authentication Middleware
    exports.io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) {
                return next(new Error('Authentication error: Token is required'));
            }
            const decoded = (0, jwt_util_1.verifyAccessToken)(token);
            socket.data.user = decoded;
            next();
        }
        catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });
    exports.io.on(constants_1.SOCKET_EVENTS.CONNECT, (socket) => {
        const connUserId = socket.data.user.userId;
        console.log(`Socket connected: ${socket.id} (User: ${connUserId})`);
        redis_1.redis.sadd('online_users', connUserId).catch(err => console.error(err));
        socket.join(`user:${connUserId}`);
        // Matchmaking Join Queue
        socket.on(constants_1.SOCKET_EVENTS.JOIN_QUEUE, async () => {
            try {
                const userId = socket.data.user.userId;
                // Fetch user ELO from MySQL
                const user = await prisma_1.prisma.user.findUnique({
                    where: { id: userId },
                });
                if (!user) {
                    socket.emit(constants_1.SOCKET_EVENTS.ERROR, { message: 'User not found' });
                    return;
                }
                // Check if already in queue
                const alreadyInQueue = matchmaking_1.matchmakingQueue.find((p) => p.userId === userId);
                if (alreadyInQueue) {
                    socket.emit(constants_1.SOCKET_EVENTS.QUEUE_STATUS, { message: 'Already in queue' });
                    return;
                }
                const player = {
                    userId,
                    socketId: socket.id,
                    username: user.username,
                    elo: user.elo_rating,
                };
                matchmaking_1.matchmakingQueue.push(player);
                console.log(`Player joined queue: ${player.username} (ELO: ${player.elo})`);
                socket.emit(constants_1.SOCKET_EVENTS.QUEUE_STATUS, { status: 'QUEUED', elo: player.elo });
                // Try matchmaking
                await (0, matchmaking_1.tryMatchmaking)();
            }
            catch (err) {
                console.error('Error joining matchmaking queue:', err);
                socket.emit(constants_1.SOCKET_EVENTS.ERROR, { message: 'Failed to join matchmaking queue' });
            }
        });
        // Leave Queue
        socket.on(constants_1.SOCKET_EVENTS.LEAVE_QUEUE, () => {
            (0, matchmaking_1.removeUserFromQueue)(socket.data.user.userId);
            socket.emit(constants_1.SOCKET_EVENTS.QUEUE_STATUS, { status: 'IDLE' });
        });
        // Handle Forfeit/Leave Match
        socket.on(constants_1.SOCKET_EVENTS.FORFEIT_MATCH, async (data) => {
            try {
                const userId = socket.data.user.userId;
                await (0, matchmaking_1.handleForfeit)(data.matchId, userId);
            }
            catch (err) {
                console.error('Error forfeiting match:', err);
            }
        });
        // Custom Room Subscriptions
        socket.on('join-lobby', () => {
            socket.join('lobby');
            console.log(`Socket ${socket.id} joined lobby`);
        });
        socket.on('leave-lobby', () => {
            socket.leave('lobby');
            console.log(`Socket ${socket.id} left lobby`);
        });
        socket.on(constants_1.SOCKET_EVENTS.JOIN_CUSTOM_ROOM, (data) => {
            socket.join(`custom-room:${data.roomCode}`);
            console.log(`Socket ${socket.id} joined custom-room: ${data.roomCode}`);
        });
        socket.on(constants_1.SOCKET_EVENTS.LEAVE_CUSTOM_ROOM, (data) => {
            socket.leave(`custom-room:${data.roomCode}`);
            console.log(`Socket ${socket.id} left custom-room: ${data.roomCode}`);
        });
        socket.on('join-match', (data) => {
            socket.join(`match:${data.matchId}`);
            console.log(`Socket ${socket.id} joined match: ${data.matchId}`);
        });
        socket.on('leave-match', (data) => {
            socket.leave(`match:${data.matchId}`);
            console.log(`Socket ${socket.id} left match: ${data.matchId}`);
        });
        socket.on(constants_1.SOCKET_EVENTS.JOIN_CONTEST, (data) => {
            socket.join(`contest:${data.contestId}`);
            console.log(`Socket ${socket.id} joined contest: ${data.contestId}`);
        });
        socket.on(constants_1.SOCKET_EVENTS.LEAVE_CONTEST, (data) => {
            socket.leave(`contest:${data.contestId}`);
            console.log(`Socket ${socket.id} left contest: ${data.contestId}`);
        });
        socket.on(constants_1.SOCKET_EVENTS.DISCONNECT, () => {
            console.log(`Socket disconnected: ${socket.id}`);
            (0, matchmaking_1.removeUserFromQueue)(socket.data.user.userId);
            redis_1.redis.srem('online_users', socket.data.user.userId).catch(err => console.error(err));
        });
    });
    // Subscribe to Redis Pub/Sub submission updates
    pubSubClient.subscribe(constants_1.REDIS_CHANNELS.SUBMISSION_UPDATES, (err) => {
        if (err) {
            console.error(`Failed to subscribe to ${constants_1.REDIS_CHANNELS.SUBMISSION_UPDATES} channel:`, err);
        }
        else {
            console.log(`Subscribed to ${constants_1.REDIS_CHANNELS.SUBMISSION_UPDATES} channel successfully`);
        }
    });
    pubSubClient.on('message', async (channel, message) => {
        if (channel === constants_1.REDIS_CHANNELS.SUBMISSION_UPDATES) {
            try {
                const data = JSON.parse(message);
                await (0, matchmaking_1.handleSubmissionUpdate)(data);
            }
            catch (err) {
                console.error('Error parsing submission update message:', err);
            }
        }
    });
};
exports.initSocket = initSocket;
