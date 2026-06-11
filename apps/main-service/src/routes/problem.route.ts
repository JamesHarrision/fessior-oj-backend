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
router.get('/tags',
  /* #swagger.tags = ['Problems']
     #swagger.summary = 'List available tags'
  */
  problemController.getTags);

router.post('/tags',
  /* #swagger.tags = ['Problems']
     #swagger.summary = 'Create a tag (admin)'
     #swagger.security = [{ "bearerAuth": [] }]
  */
  requireAuth, requireAdmin, problemController.createTag);

// Problems
// Problems
router.get('/',
  /* #swagger.tags = ['Problems']
     #swagger.summary = 'List problems (with pagination and filters)'
     #swagger.parameters['page'] = { in: 'query', schema: { type: 'number' } }
     #swagger.parameters['limit'] = { in: 'query', schema: { type: 'number' } }
  */
  problemController.listProblems);

router.get('/:slug',
  /* #swagger.tags = ['Problems']
     #swagger.summary = 'Get problem details by slug'
     #swagger.parameters['slug'] = { in: 'path', required: true, schema: { type: 'string' } }
  */
  problemController.getProblem);

router.post(
  '/',
  /* #swagger.tags = ['Problems']
     #swagger.summary = 'Create a new problem (admin)'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProblem' } } } }
  */
  requireAuth,
  requireAdmin,
  validateRequest(createProblemSchema),
  problemController.createProblem
);

router.put(
  '/:id',
  /* #swagger.tags = ['Problems']
     #swagger.summary = 'Update problem (admin)'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['id'] = { in: 'path', required: true, schema: { type: 'string' } }
  */
  requireAuth,
  requireAdmin,
  validateRequest(updateProblemSchema),
  problemController.updateProblem
);

router.delete('/:id',
  /* #swagger.tags = ['Problems']
     #swagger.summary = 'Delete problem (admin)'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['id'] = { in: 'path', required: true, schema: { type: 'string' } }
  */
  requireAuth, requireAdmin, problemController.deleteProblem);

// Testcases
// Testcases
router.post(
  '/:problemId/testcases',
  /* #swagger.tags = ['Problems']
     #swagger.summary = 'Add testcase to problem (admin)'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['problemId'] = { in: 'path', required: true, schema: { type: 'string' } }
     #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTestcase' } } } }
  */
  requireAuth,
  requireAdmin,
  validateRequest(createTestcaseSchema),
  problemController.addTestcase
);

router.get('/:problemId/testcases',
  /* #swagger.tags = ['Problems']
     #swagger.summary = 'Get testcases for a problem'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['problemId'] = { in: 'path', required: true, schema: { type: 'string' } }
  */
  requireAuth, problemController.getTestcases);

router.delete('/testcases/:testcaseId',
  /* #swagger.tags = ['Problems']
     #swagger.summary = 'Delete a testcase (admin)'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['testcaseId'] = { in: 'path', required: true, schema: { type: 'string' } }
  */
  requireAuth, requireAdmin, problemController.deleteTestcase);

export default router;
