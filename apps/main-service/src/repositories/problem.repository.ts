import { prisma } from '../config/prisma';
import { Problem, IProblem } from '../models/problem.model';
import { Testcase, ITestcase } from '../models/testcase.model';
import { Difficulty } from '@prisma/client';

export class ProblemRepository {
  async createProblem(
    data: Partial<IProblem> & { tags?: string[] }
  ) {
    // 1. Save to MongoDB
    const problem = new Problem({
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
    await prisma.problemIndex.create({
      data: {
        mongo_problem_id: problem._id.toString(),
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty as Difficulty,
        tags: {
          create: data.tags?.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })) || [],
        },
      },
    });

    return problem;
  }

  async updateProblem(
    mongoId: string,
    data: Partial<IProblem> & { tags?: string[] }
  ) {
    // 1. Update MongoDB
    const problem = await Problem.findByIdAndUpdate(mongoId, data, { new: true });
    if (!problem) return null;

    // 2. Update MySQL Index
    await prisma.$transaction(async (tx) => {
      // Update basic fields
      await tx.problemIndex.update({
        where: { mongo_problem_id: mongoId },
        data: {
          title: problem.title,
          slug: problem.slug,
          difficulty: problem.difficulty as Difficulty,
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

  async deleteProblem(mongoId: string) {
    // 1. Delete MongoDB Problem & Testcases
    await Problem.findByIdAndDelete(mongoId);
    await Testcase.deleteMany({ problemId: mongoId });

    // 2. Delete MySQL Index (cascade will handle problemIndexTags if configured, otherwise handle manually)
    // In our Prisma schema, onDelete: Cascade is set for problemIndexTags relation to problem
    await prisma.problemIndex.delete({
      where: { mongo_problem_id: mongoId },
    });

    return true;
  }

  async getProblemBySlug(slug: string) {
    let query: any = { slug };
    // Mongoose ObjectId is 24 hex characters
    if (/^[0-9a-fA-F]{24}$/.test(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }
    const problem = await Problem.findOne(query);
    if (!problem) return null;

    // Fetch tags from SQL
    const indexEntry = await prisma.problemIndex.findUnique({
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

  async getProblemsList(filters: {
    difficulty?: Difficulty;
    tagSlug?: string;
    page: number;
    limit: number;
  }) {
    const { difficulty, tagSlug, page, limit } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
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

    const [total, items] = await prisma.$transaction([
      prisma.problemIndex.count({ where: whereClause }),
      prisma.problemIndex.findMany({
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

    const formattedItems = items.map((item) => ({
      id: item.mongo_problem_id,
      title: item.title,
      slug: item.slug,
      difficulty: item.difficulty,
      created_at: item.created_at,
      tags: item.tags.map((t) => t.tag),
    }));

    return {
      total,
      page,
      limit,
      items: formattedItems,
    };
  }

  // Testcase Management
  async addTestcase(problemId: string, data: { isExample: boolean; input: string; output: string }) {
    const testcase = new Testcase({
      problemId,
      isExample: data.isExample,
      input: data.input,
      output: data.output,
    });
    return await testcase.save();
  }

  async getTestcases(problemId: string, excludeHidden = false) {
    const query: any = { problemId };
    if (excludeHidden) {
      query.isExample = true;
    }
    return await Testcase.find(query);
  }

  async deleteTestcase(testcaseId: string) {
    return await Testcase.findByIdAndDelete(testcaseId);
  }
}
export const problemRepository = new ProblemRepository();
