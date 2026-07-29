"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.problemService = exports.ProblemService = void 0;
const problem_repository_1 = require("../repositories/problem.repository");
const prisma_1 = require("../config/prisma");
const errors_1 = require("@ocj/errors");
class ProblemService {
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // remove accents
            .replace(/\s+/g, '-') // replace spaces with -
            .replace(/[^\w\-]+/g, '') // remove all non-word chars
            .replace(/\-\-+/g, '-') // replace multiple - with single -
            .replace(/^-+/, '') // trim - from start of text
            .replace(/-+$/, ''); // trim - from end of text
    }
    async createProblem(data) {
        let slug = this.slugify(data.title);
        // Check slug collision
        const existingIndex = await prisma_1.prisma.problemIndex.findUnique({
            where: { slug },
        });
        if (existingIndex) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        return await problem_repository_1.problemRepository.createProblem({
            ...data,
            slug,
        });
    }
    async updateProblem(mongoId, data) {
        const updateData = { ...data };
        if (data.title) {
            let slug = this.slugify(data.title);
            const existingIndex = await prisma_1.prisma.problemIndex.findFirst({
                where: {
                    slug,
                    NOT: { mongo_problem_id: mongoId },
                },
            });
            if (existingIndex) {
                slug = `${slug}-${Date.now().toString().slice(-4)}`;
            }
            updateData.slug = slug;
        }
        const problem = await problem_repository_1.problemRepository.updateProblem(mongoId, updateData);
        if (!problem) {
            throw new errors_1.AppError('Problem not found', 404);
        }
        return problem;
    }
    async deleteProblem(mongoId) {
        const deleted = await problem_repository_1.problemRepository.deleteProblem(mongoId);
        if (!deleted) {
            throw new errors_1.AppError('Problem not found', 404);
        }
        return true;
    }
    async getProblemBySlug(slug) {
        const problem = await problem_repository_1.problemRepository.getProblemBySlug(slug);
        if (!problem) {
            throw new errors_1.AppError('Problem not found', 404);
        }
        return problem;
    }
    async getProblemsList(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        return await problem_repository_1.problemRepository.getProblemsList({
            difficulty: filters.difficulty,
            tagSlug: filters.tagSlug,
            page,
            limit,
            userId: filters.userId,
        });
    }
    // Tags Management
    async createTag(name, color) {
        const slug = this.slugify(name);
        const existing = await prisma_1.prisma.tag.findUnique({ where: { slug } });
        if (existing) {
            throw new errors_1.AppError('Tag already exists', 400);
        }
        return await prisma_1.prisma.tag.create({
            data: { name, slug, color },
        });
    }
    async getTags() {
        return await prisma_1.prisma.tag.findMany({
            orderBy: { name: 'asc' },
        });
    }
    // Testcase Management
    async addTestcase(problemId, isExample, input, output) {
        const problem = await problem_repository_1.problemRepository.getProblemBySlug(problemId); // checks if exists
        const mongoId = problem ? problem._id.toString() : problemId; // slug or ID
        // Check if mongoId is valid objectId representation
        let realMongoId = mongoId;
        if (problem) {
            realMongoId = problem._id.toString();
        }
        return await problem_repository_1.problemRepository.addTestcase(realMongoId, { isExample, input, output });
    }
    async getTestcases(problemId, isExampleOnly = false) {
        const problem = await problem_repository_1.problemRepository.getProblemBySlug(problemId);
        const realMongoId = problem ? problem._id.toString() : problemId;
        return await problem_repository_1.problemRepository.getTestcases(realMongoId, isExampleOnly);
    }
    async deleteTestcase(testcaseId) {
        return await problem_repository_1.problemRepository.deleteTestcase(testcaseId);
    }
}
exports.ProblemService = ProblemService;
exports.problemService = new ProblemService();
