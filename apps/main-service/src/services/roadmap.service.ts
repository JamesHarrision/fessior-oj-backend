import { prisma } from '../config/prisma';
import { AppError } from '@ocj/errors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { addDays, parseISO } from 'date-fns';

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

export class RoadmapService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  async generateRoadmap(userId: string, userPrompt: string, startDate?: string) {
    // 1. Check Limits
    const activeCount = await prisma.roadmap.count({
      where: { user_id: userId, is_active: true }
    });
    if (activeCount >= MAX_ROADMAPS_PER_USER) {
      throw new AppError(`You can only have up to ${MAX_ROADMAPS_PER_USER} active roadmaps at a time.`, 400);
    }

    // 2. Fetch all existing problem slugs to guide AI (if possible, or just validate later)
    // We will validate later to prevent hallucinated slugs.
    const allProblems = await prisma.problemIndex.findMany({
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
      } catch (error) {
        console.error("Gemini Roadmap Generation Failed. Using fallback:", error);
      }
    }

    // 4. Save to Database
    const baseDate = startDate ? parseISO(startDate) : new Date();

    const createdRoadmap = await prisma.roadmap.create({
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
                // Calculate estimated date: 1 session per day roughly? Let's space them by 1 day
                const sessionDate = addDays(baseDate, pIndex * 7 + sIndex);
                
                // Filter only valid problems
                const validProblemMongoIds = (session.recommendedProblemSlugs || [])
                  .filter((slug: string) => validSlugs.has(slug))
                  .map((slug: string) => slugToMongoId.get(slug)!);

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

    return createdRoadmap;
  }

  async getUserRoadmaps(userId: string) {
    return prisma.roadmap.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  async getRoadmapDetail(roadmapId: string, userId: string) {
    const roadmap = await prisma.roadmap.findUnique({
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
      throw new AppError('Roadmap not found', 404);
    }
    
    // Allow if owner or if shared
    if (roadmap.user_id !== userId && !roadmap.is_shared) {
      throw new AppError('Forbidden', 403);
    }

    return roadmap;
  }

  async updateRoadmapSession(sessionId: string, userId: string, data: { date?: string, is_completed?: boolean }) {
    // Verify ownership
    const session = await prisma.roadmapSession.findUnique({
      where: { id: sessionId },
      include: { phase: { include: { roadmap: true } } }
    });

    if (!session || session.phase.roadmap.user_id !== userId) {
      throw new AppError('Session not found or forbidden', 404);
    }

    const updateData: any = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.is_completed !== undefined) {
      updateData.is_completed = data.is_completed;
      updateData.completed_at = data.is_completed ? new Date() : null;
    }

    return prisma.roadmapSession.update({
      where: { id: sessionId },
      data: updateData
    });
  }

  async toggleRoadmapShare(roadmapId: string, userId: string, isShared: boolean) {
    const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap || roadmap.user_id !== userId) {
      throw new AppError('Roadmap not found or forbidden', 404);
    }

    return prisma.roadmap.update({
      where: { id: roadmapId },
      data: { is_shared: isShared }
    });
  }

  async deleteRoadmap(roadmapId: string, userId: string) {
    const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap || roadmap.user_id !== userId) {
      throw new AppError('Roadmap not found or forbidden', 404);
    }

    await prisma.roadmap.delete({ where: { id: roadmapId } });
    return { success: true };
  }
}

export const roadmapService = new RoadmapService();
