import { Router } from 'express';
import { problemController } from '../controllers/problem.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createProblemSchema,
  updateProblemSchema,
  createTestcaseSchema,
} from '../validators/problem.validator';

const router = Router();

// Tags
router.get('/tags', problemController.getTags);
router.post('/tags', requireAuth, requireAdmin, problemController.createTag);

// Problems
router.get('/', problemController.listProblems);
router.get('/:slug', problemController.getProblem);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validateRequest(createProblemSchema),
  problemController.createProblem
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validateRequest(updateProblemSchema),
  problemController.updateProblem
);

router.delete('/:id', requireAuth, requireAdmin, problemController.deleteProblem);

// Testcases
router.post(
  '/:problemId/testcases',
  requireAuth,
  requireAdmin,
  validateRequest(createTestcaseSchema),
  problemController.addTestcase
);

router.get('/:problemId/testcases', requireAuth, problemController.getTestcases);
router.delete('/testcases/:testcaseId', requireAuth, requireAdmin, problemController.deleteTestcase);

export default router;
