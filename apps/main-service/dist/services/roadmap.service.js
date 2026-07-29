"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roadmapService = exports.RoadmapService = void 0;
const prisma_1 = require("../config/prisma");
const errors_1 = require("@ocj/errors");
const generative_ai_1 = require("@google/generative-ai");
const date_fns_1 = require("date-fns");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MAX_ROADMAPS_PER_USER = 5;
// Basic fallback for robust error handling
const fallbackRoadmap = {
    title: "Personalized DSA Roadmap",
    description: "A structured path generated based on your input.",
    phases: [
        {
            title: "Phase 1: Basics",
            description: "Fundamental data structures.",
            sessions: [
                {
                    title: "Arrays & Hashing",
                    description: "Learn O(1) lookups.",
                    recommendedProblemSlugs: ["two-sum", "contains-duplicate"]
                }
            ]
        }
    ]
};
class RoadmapService {
    genAI = null;
    constructor() {
        if (GEMINI_API_KEY) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
        }
    }
    async generateRoadmap(userId, userPrompt, startDate) {
        // 1. Check Limits
        const activeCount = await prisma_1.prisma.roadmap.count({
            where: { user_id: userId, is_active: true }
        });
        if (activeCount >= MAX_ROADMAPS_PER_USER) {
            throw new errors_1.AppError(`You can only have up to ${MAX_ROADMAPS_PER_USER} active roadmaps at a time.`, 400);
        }
        // 2. Fetch all existing problem slugs to guide AI (if possible, or just validate later)
        // We will validate later to prevent hallucinated slugs.
        const allProblems = await prisma_1.prisma.problemIndex.findMany({
            select: { slug: true, mongo_problem_id: true }
        });
        const validSlugs = new Set(allProblems.map(p => p.slug));
        const slugToMongoId = new Map(allProblems.map(p => [p.slug, p.mongo_problem_id]));
        // 3. Generate Roadmap via AI
        let roadmapData = fallbackRoadmap;
        if (this.genAI) {
            try {
                const model = this.genAI.getGenerativeModel({
                    model: 'gemini-2.5-flash',
                    generationConfig: { responseMimeType: 'application/json' },
                });
                const prompt = `
          You are an expert algorithms coach.
          The user has requested a DSA learning roadmap based on this prompt:
          "${userPrompt}"

          Generate a structured roadmap in JSON format.
          The JSON structure MUST follow this exact schema:
          {
            "title": "Roadmap Title",
            "description": "Short description",
            "phases": [
              {
                "title": "Phase Name (e.g. Trees & Graphs)",
                "description": "What to learn in this phase",
                "sessions": [
                  {
                    "title": "Session Name (e.g. Binary Search Trees)",
                    "description": "Focus of the session",
                    "recommendedProblemSlugs": ["slug-1", "slug-2"]
                  }
                ]
              }
            ]
          }
          
          Provide at most 3-5 phases, with 2-4 sessions each. Try to recommend typical LeetCode-style problem slugs (e.g. "two-sum", "valid-parentheses", "lru-cache").
        `;
                const result = await model.generateContent(prompt);
                roadmapData = JSON.parse(result.response.text());
            }
            catch (error) {
                console.error("Gemini Roadmap Generation Failed. Using fallback:", error);
            }
        }
        // 4. Save to Database
        const baseDate = startDate ? (0, date_fns_1.parseISO)(startDate) : new Date();
        const createdRoadmap = await prisma_1.prisma.roadmap.create({
            data: {
                user_id: userId,
                title: roadmapData.title || "My Custom Roadmap",
                description: roadmapData.description || "",
                is_active: true,
                phases: {
                    create: roadmapData.phases.map((phase, pIndex) => ({
                        title: phase.title,
                        description: phase.description,
                        order: pIndex,
                        sessions: {
                            create: phase.sessions.map((session, sIndex) => {
                                const sessionDate = (0, date_fns_1.addDays)(baseDate, pIndex * 7 + sIndex);
                                const validProblemMongoIds = (session.recommendedProblemSlugs || [])
                                    .filter((slug) => validSlugs.has(slug))
                                    .map((slug) => slugToMongoId.get(slug));
                                return {
                                    title: session.title,
                                    description: session.description,
                                    order: sIndex,
                                    date: sessionDate,
                                    problems: {
                                        create: validProblemMongoIds.map(mongoId => ({
                                            mongo_problem_id: mongoId
                                        }))
                                    }
                                };
                            })
                        }
                    }))
                }
            },
            include: {
                phases: {
                    include: {
                        sessions: {
                            include: {
                                problems: true
                            }
                        }
                    }
                }
            }
        });
        // Create Notification
        await prisma_1.prisma.notification.create({
            data: {
                user_id: userId,
                title: 'Roadmap Generated!',
                content: `Your new DSA roadmap "${createdRoadmap.title}" is ready. Don't forget to stick to the schedule!`,
                type: 'SYSTEM',
            }
        });
        return createdRoadmap;
    }
    async getUserRoadmaps(userId) {
        return prisma_1.prisma.roadmap.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
    }
    async getRoadmapDetail(roadmapId, userId) {
        const roadmap = await prisma_1.prisma.roadmap.findUnique({
            where: { id: roadmapId },
            include: {
                phases: {
                    orderBy: { order: 'asc' },
                    include: {
                        sessions: {
                            orderBy: { order: 'asc' },
                            include: {
                                problems: true
                            }
                        }
                    }
                }
            }
        });
        if (!roadmap) {
            throw new errors_1.AppError('Roadmap not found', 404);
        }
        // Allow if owner or if shared
        if (roadmap.user_id !== userId && !roadmap.is_shared) {
            throw new errors_1.AppError('Forbidden', 403);
        }
        return roadmap;
    }
    async updateRoadmapSession(sessionId, userId, data) {
        // Verify ownership
        const session = await prisma_1.prisma.roadmapSession.findUnique({
            where: { id: sessionId },
            include: { phase: { include: { roadmap: true } } }
        });
        if (!session || session.phase.roadmap.user_id !== userId) {
            throw new errors_1.AppError('Session not found or forbidden', 404);
        }
        const updateData = {};
        if (data.date !== undefined)
            updateData.date = new Date(data.date);
        if (data.is_completed !== undefined) {
            updateData.is_completed = data.is_completed;
            updateData.completed_at = data.is_completed ? new Date() : null;
        }
        return prisma_1.prisma.roadmapSession.update({
            where: { id: sessionId },
            data: updateData
        });
    }
    async toggleRoadmapShare(roadmapId, userId, isShared) {
        const roadmap = await prisma_1.prisma.roadmap.findUnique({ where: { id: roadmapId } });
        if (!roadmap || roadmap.user_id !== userId) {
            throw new errors_1.AppError('Roadmap not found or forbidden', 404);
        }
        return prisma_1.prisma.roadmap.update({
            where: { id: roadmapId },
            data: { is_shared: isShared }
        });
    }
    async deleteRoadmap(roadmapId, userId) {
        const roadmap = await prisma_1.prisma.roadmap.findUnique({ where: { id: roadmapId } });
        if (!roadmap || roadmap.user_id !== userId) {
            throw new errors_1.AppError('Roadmap not found or forbidden', 404);
        }
        await prisma_1.prisma.roadmap.delete({ where: { id: roadmapId } });
        return { success: true };
    }
}
exports.RoadmapService = RoadmapService;
exports.roadmapService = new RoadmapService();
