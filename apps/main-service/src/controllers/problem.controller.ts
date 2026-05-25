import { Request, Response, NextFunction } from 'express';
import { problemService } from '../services/problem.service';
import { Difficulty } from '@prisma/client';

export class ProblemController {
  async createProblem(req: Request, res: Response, next: NextFunction) {
    try {
      const problem = await problemService.createProblem(req.body);
      res.status(201).json({
        status: 'Success',
        data: problem,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProblem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const problem = await problemService.updateProblem(id, req.body);
      res.status(200).json({
        status: 'Success',
        data: problem,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProblem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await problemService.deleteProblem(id);
      res.status(200).json({
        status: 'Success',
        message: 'Problem deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getProblem(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const problem = await problemService.getProblemBySlug(slug);
      res.status(200).json({
        status: 'Success',
        data: problem,
      });
    } catch (error) {
      next(error);
    }
  }

  async listProblems(req: Request, res: Response, next: NextFunction) {
    try {
      const difficulty = req.query.difficulty as Difficulty | undefined;
      const tagSlug = req.query.tag as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const result = await problemService.getProblemsList({
        difficulty,
        tagSlug,
        page,
        limit,
      });

      res.status(200).json({
        status: 'Success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Tag endpoints
  async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, color } = req.body;
      const tag = await problemService.createTag(name, color);
      res.status(201).json({
        status: 'Success',
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await problemService.getTags();
      res.status(200).json({
        status: 'Success',
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  }

  // Testcase endpoints
  async addTestcase(req: Request, res: Response, next: NextFunction) {
    try {
      const problemId = req.params.problemId as string;
      const { isExample, input, output } = req.body;
      const testcase = await problemService.addTestcase(problemId, isExample, input, output);
      res.status(201).json({
        status: 'Success',
        data: testcase,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTestcases(req: Request, res: Response, next: NextFunction) {
    try {
      const problemId = req.params.problemId as string;
      const isExampleOnly = req.query.example === 'true';
      const testcases = await problemService.getTestcases(problemId, isExampleOnly);
      res.status(200).json({
        status: 'Success',
        data: testcases,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTestcase(req: Request, res: Response, next: NextFunction) {
    try {
      const testcaseId = req.params.testcaseId as string;
      await problemService.deleteTestcase(testcaseId);
      res.status(200).json({
        status: 'Success',
        message: 'Testcase deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const problemController = new ProblemController();
