"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.problemController = exports.ProblemController = void 0;
const problem_service_1 = require("../services/problem.service");
class ProblemController {
    async createProblem(req, res, next) {
        try {
            const problem = await problem_service_1.problemService.createProblem(req.body);
            res.status(201).json({
                status: 'Success',
                data: problem,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProblem(req, res, next) {
        try {
            const id = req.params.id;
            const problem = await problem_service_1.problemService.updateProblem(id, req.body);
            res.status(200).json({
                status: 'Success',
                data: problem,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteProblem(req, res, next) {
        try {
            const id = req.params.id;
            await problem_service_1.problemService.deleteProblem(id);
            res.status(200).json({
                status: 'Success',
                message: 'Problem deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProblem(req, res, next) {
        try {
            const slug = req.params.slug;
            const problem = await problem_service_1.problemService.getProblemBySlug(slug);
            res.status(200).json({
                status: 'Success',
                data: problem,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async listProblems(req, res, next) {
        try {
            const userId = req.user?.userId;
            const difficulty = req.query.difficulty;
            const tagSlug = req.query.tag;
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const result = await problem_service_1.problemService.getProblemsList({
                difficulty,
                tagSlug,
                page,
                limit,
                userId,
            });
            res.status(200).json({
                status: 'Success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Tag endpoints
    async createTag(req, res, next) {
        try {
            const { name, color } = req.body;
            const tag = await problem_service_1.problemService.createTag(name, color);
            res.status(201).json({
                status: 'Success',
                data: tag,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTags(req, res, next) {
        try {
            const tags = await problem_service_1.problemService.getTags();
            res.status(200).json({
                status: 'Success',
                data: tags,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Testcase endpoints
    async addTestcase(req, res, next) {
        try {
            const problemId = req.params.problemId;
            const { isExample, input, output } = req.body;
            const testcase = await problem_service_1.problemService.addTestcase(problemId, isExample, input, output);
            res.status(201).json({
                status: 'Success',
                data: testcase,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTestcases(req, res, next) {
        try {
            const problemId = req.params.problemId;
            const isExampleOnly = req.query.example === 'true';
            const testcases = await problem_service_1.problemService.getTestcases(problemId, isExampleOnly);
            res.status(200).json({
                status: 'Success',
                data: testcases,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTestcase(req, res, next) {
        try {
            const testcaseId = req.params.testcaseId;
            await problem_service_1.problemService.deleteTestcase(testcaseId);
            res.status(200).json({
                status: 'Success',
                message: 'Testcase deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProblemController = ProblemController;
exports.problemController = new ProblemController();
