"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roadmap_controller_1 = require("../controllers/roadmap.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const roadmap_validator_1 = require("../validators/roadmap.validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.requireAuth);
router.post('/', (0, validate_middleware_1.validateRequest)(roadmap_validator_1.generateRoadmapSchema), roadmap_controller_1.roadmapController.generateRoadmap);
router.get('/', roadmap_controller_1.roadmapController.getUserRoadmaps);
router.get('/:id', roadmap_controller_1.roadmapController.getRoadmapDetail);
router.patch('/sessions/:id', (0, validate_middleware_1.validateRequest)(roadmap_validator_1.updateRoadmapSessionSchema), roadmap_controller_1.roadmapController.updateSession);
router.patch('/:id/share', roadmap_controller_1.roadmapController.toggleShare);
router.delete('/:id', roadmap_controller_1.roadmapController.deleteRoadmap);
exports.default = router;
