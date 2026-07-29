"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roadmapController = exports.RoadmapController = void 0;
const roadmap_service_1 = require("../services/roadmap.service");
class RoadmapController {
    async generateRoadmap(req, res, next) {
        try {
            const { prompt, startDate } = req.body;
            const userId = req.user.userId;
            const roadmap = await roadmap_service_1.roadmapService.generateRoadmap(userId, prompt, startDate);
            res.status(201).json({ status: "Success", data: roadmap });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserRoadmaps(req, res, next) {
        try {
            const userId = req.user.userId;
            const roadmaps = await roadmap_service_1.roadmapService.getUserRoadmaps(userId);
            res.status(200).json({ status: "Success", data: roadmaps });
        }
        catch (error) {
            next(error);
        }
    }
    async getRoadmapDetail(req, res, next) {
        try {
            const id = req.params.id;
            const userId = req.user.userId;
            const roadmap = await roadmap_service_1.roadmapService.getRoadmapDetail(id, userId);
            res.status(200).json({ status: "Success", data: roadmap });
        }
        catch (error) {
            next(error);
        }
    }
    async updateSession(req, res, next) {
        try {
            const id = req.params.id; // session id
            const userId = req.user.userId;
            const updateData = req.body;
            const session = await roadmap_service_1.roadmapService.updateRoadmapSession(id, userId, updateData);
            res.status(200).json({ status: "Success", data: session });
        }
        catch (error) {
            next(error);
        }
    }
    async toggleShare(req, res, next) {
        try {
            const id = req.params.id; // roadmap id
            const userId = req.user.userId;
            const { is_shared } = req.body;
            const roadmap = await roadmap_service_1.roadmapService.toggleRoadmapShare(id, userId, is_shared);
            res.status(200).json({ status: "Success", data: roadmap });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteRoadmap(req, res, next) {
        try {
            const id = req.params.id;
            const userId = req.user.userId;
            await roadmap_service_1.roadmapService.deleteRoadmap(id, userId);
            res.status(200).json({ status: "Success", message: "Roadmap deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RoadmapController = RoadmapController;
exports.roadmapController = new RoadmapController();
