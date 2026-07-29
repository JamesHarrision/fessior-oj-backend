"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.problemRepository = exports.ProblemRepository = void 0;
const prisma_1 = require("../config/prisma");
const problem_model_1 = require("../models/problem.model");
const testcase_model_1 = require("../models/testcase.model");
const submission_model_1 = require("../models/submission.model");
class ProblemRepository {
    async createProblem(data) {
        // 1. Save to MongoDB
        const problem = new problem_model_1.Problem({
            title: data.title,
            slug: data.slug,
            description: data.description,
            difficulty: data.difficulty,
            timeLimit: data.timeLimit,
            memoryLimit: data.memoryLimit,
            starterCodes: data.starterCodes,
            editorialMarkdown: data.editorialMarkdown,
            editorialVideoUrl: data.editorialVideoUrl,
        });
        await problem.save();
        // 2. Save to MySQL Index
        await prisma_1.prisma.problemIndex.create({
            data: {
                mongo_problem_id: problem._id.toString(),
                title: problem.title,
                slug: problem.slug,
                difficulty: problem.difficulty,
                tags: {
                    create: data.tags?.map((tagId) => ({
                        tag: { connect: { id: tagId } },
                    })) || [],
                },
            },
        });
        return problem;
    }
    async updateProblem(mongoId, data) {
        // 1. Update MongoDB
        const problem = await problem_model_1.Problem.findByIdAndUpdate(mongoId, data, { new: true });
        if (!problem)
            return null;
        // 2. Update MySQL Index
        await prisma_1.prisma.$transaction(async (tx) => {
            // Update basic fields
            await tx.problemIndex.update({
                where: { mongo_problem_id: mongoId },
                data: {
                    title: problem.title,
                    slug: problem.slug,
                    difficulty: problem.difficulty,
                },
            });
            // Update tags if provided
            if (data.tags) {
                // Delete existing tag links
                await tx.problemIndexTag.deleteMany({
                    where: { mongo_problem_id: mongoId },
                });
                // Insert new tag links
                if (data.tags.length > 0) {
                    await tx.problemIndexTag.createMany({
                        data: data.tags.map((tagId) => ({
                            mongo_problem_id: mongoId,
                            tag_id: tagId,
                        })),
                    });
                }
            }
        });
        return problem;
    }
    async deleteProblem(mongoId) {
        // 1. Delete MongoDB Problem & Testcases
        await problem_model_1.Problem.findByIdAndDelete(mongoId);
        await testcase_model_1.Testcase.deleteMany({ problemId: mongoId });
        // 2. Delete MySQL Index (cascade will handle problemIndexTags if configured, otherwise handle manually)
        // In our Prisma schema, onDelete: Cascade is set for problemIndexTags relation to problem
        await prisma_1.prisma.problemIndex.delete({
            where: { mongo_problem_id: mongoId },
        });
        return true;
    }
    async getProblemBySlug(slug) {
        let query = { slug };
        // Mongoose ObjectId is 24 hex characters
        if (/^[0-9a-fA-F]{24}$/.test(slug)) {
            query = { $or: [{ slug }, { _id: slug }] };
        }
        const problem = await problem_model_1.Problem.findOne(query);
        if (!problem)
            return null;
        // Fetch tags from SQL
        const indexEntry = await prisma_1.prisma.problemIndex.findUnique({
            where: { mongo_problem_id: problem._id.toString() },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        const tags = indexEntry?.tags.map((t) => t.tag) || [];
        return {
            ...problem.toObject(),
            tags,
        };
    }
    async getProblemsList(filters) {
        const { difficulty, tagSlug, page, limit, userId } = filters;
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (difficulty) {
            whereClause.difficulty = difficulty;
        }
        if (tagSlug) {
            whereClause.tags = {
                some: {
                    tag: {
                        slug: tagSlug,
                    },
                },
            };
        }
        const [total, items] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.problemIndex.count({ where: whereClause }),
            prisma_1.prisma.problemIndex.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            }),
        ]);
        const problemIds = items.map(item => item.mongo_problem_id);
        // Aggregate submissions for acceptance rate
        const submissionStats = await submission_model_1.Submission.aggregate([
            { $match: { problemId: { $in: problemIds.map(id => new (require('mongoose')).Types.ObjectId(id)) } } },
            { $group: {
                    _id: "$problemId",
                    totalSubmissions: { $sum: 1 },
                    acceptedSubmissions: {
                        $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] }
                    }
                } }
        ]);
        const statsMap = new Map();
        submissionStats.forEach(stat => {
            const accRate = stat.totalSubmissions > 0
                ? Math.round((stat.acceptedSubmissions / stat.totalSubmissions) * 100)
                : 0;
            statsMap.set(stat._id.toString(), {
                acceptanceRate: accRate,
                totalSubmissions: stat.totalSubmissions
            });
        });
        // Check if current user has solved these problems
        let userSolvedSet = new Set();
        if (userId) {
            const userSolved = await submission_model_1.Submission.find({
                userId,
                problemId: { $in: problemIds },
                status: "ACCEPTED"
            }).select('problemId');
            userSolved.forEach(sub => userSolvedSet.add(sub.problemId.toString()));
        }
        const formattedItems = items.map((item) => {
            const stats = statsMap.get(item.mongo_problem_id) || { acceptanceRate: 0, totalSubmissions: 0 };
            return {
                id: item.mongo_problem_id,
                title: item.title,
                slug: item.slug,
                difficulty: item.difficulty,
                created_at: item.created_at,
                tags: item.tags.map((t) => t.tag),
                acceptanceRate: stats.acceptanceRate,
                totalSubmissions: stats.totalSubmissions,
                isSolved: userSolvedSet.has(item.mongo_problem_id)
            };
        });
        return {
            total,
            page,
            limit,
            items: formattedItems,
        };
    }
    // Testcase Management
    async addTestcase(problemId, data) {
        const testcase = new testcase_model_1.Testcase({
            problemId,
            isExample: data.isExample,
            input: data.input,
            output: data.output,
        });
        return await testcase.save();
    }
    async getTestcases(problemId, excludeHidden = false) {
        const query = { problemId };
        if (excludeHidden) {
            query.isExample = true;
        }
        return await testcase_model_1.Testcase.find(query);
    }
    async deleteTestcase(testcaseId) {
        return await testcase_model_1.Testcase.findByIdAndDelete(testcaseId);
    }
}
exports.ProblemRepository = ProblemRepository;
exports.problemRepository = new ProblemRepository();
