"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const news_controller_1 = require("../controllers/news.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const news_validator_1 = require("../validators/news.validator");
const router = (0, express_1.Router)();
// Public route to get news
router.get('/', news_controller_1.newsController.getNews);
// Admin routes
router.use(auth_middleware_1.requireAuth);
router.post('/', (0, validate_middleware_1.validateRequest)(news_validator_1.createNewsSchema), news_controller_1.newsController.createNews);
router.delete('/:newsId', news_controller_1.newsController.deleteNews);
exports.default = router;
