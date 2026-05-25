import { problemRepository } from '../repositories/problem.repository';
import { prisma } from '../config/prisma';
import { AppError } from '@ocj/errors';
import { Difficulty } from '@prisma/client';

export class ProblemService {
  private slugify(text: string): string {
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

  async createProblem(data: {
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    timeLimit: number;
    memoryLimit: number;
    starterCodes: { cpp: string; java: string; python: string };
    editorialMarkdown?: string;
    editorialVideoUrl?: string;
    tags?: string[];
  }) {
    let slug = this.slugify(data.title);
    
    // Check slug collision
    const existingIndex = await prisma.problemIndex.findUnique({
      where: { slug },
    });
    if (existingIndex) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return await problemRepository.createProblem({
      ...data,
      slug,
    } as any);
  }

  async updateProblem(
    mongoId: string,
    data: {
      title?: string;
      description?: string;
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
      timeLimit?: number;
      memoryLimit?: number;
      starterCodes?: { cpp: string; java: string; python: string };
      editorialMarkdown?: string;
      editorialVideoUrl?: string;
      tags?: string[];
    }
  ) {
    const updateData: any = { ...data };
    
    if (data.title) {
      let slug = this.slugify(data.title);
      const existingIndex = await prisma.problemIndex.findFirst({
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

    const problem = await problemRepository.updateProblem(mongoId, updateData);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }
    return problem;
  }

  async deleteProblem(mongoId: string) {
    const deleted = await problemRepository.deleteProblem(mongoId);
    if (!deleted) {
      throw new AppError('Problem not found', 404);
    }
    return true;
  }

  async getProblemBySlug(slug: string) {
    const problem = await problemRepository.getProblemBySlug(slug);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }
    return problem;
  }

  async getProblemsList(filters: {
    difficulty?: Difficulty;
    tagSlug?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    return await problemRepository.getProblemsList({
      difficulty: filters.difficulty,
      tagSlug: filters.tagSlug,
      page,
      limit,
    });
  }

  // Tags Management
  async createTag(name: string, color?: string) {
    const slug = this.slugify(name);
    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Tag already exists', 400);
    }
    return await prisma.tag.create({
      data: { name, slug, color },
    });
  }

  async getTags() {
    return await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Testcase Management
  async addTestcase(problemId: string, isExample: boolean, input: string, output: string) {
    const problem = await problemRepository.getProblemBySlug(problemId); // checks if exists
    const mongoId = problem ? problem._id.toString() : problemId; // slug or ID
    
    // Check if mongoId is valid objectId representation
    let realMongoId = mongoId;
    if (problem) {
      realMongoId = problem._id.toString();
    }
    
    return await problemRepository.addTestcase(realMongoId, { isExample, input, output });
  }

  async getTestcases(problemId: string, isExampleOnly = false) {
    const problem = await problemRepository.getProblemBySlug(problemId);
    const realMongoId = problem ? problem._id.toString() : problemId;
    return await problemRepository.getTestcases(realMongoId, isExampleOnly);
  }

  async deleteTestcase(testcaseId: string) {
    return await problemRepository.deleteTestcase(testcaseId);
  }
}
export const problemService = new ProblemService();
