"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
router.get('/sessions', chat_controller_1.chatController.getSessions);
router.post('/sessions/:sessionId/messages', chat_controller_1.chatController.sendMessage);
exports.default = router;
