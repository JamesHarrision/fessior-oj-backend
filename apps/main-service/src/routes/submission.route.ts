import { Router } from 'express';
import { submissionController } from '../controllers/submission.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { submitCodeSchema } from '../validators/submission.validator';

const router = Router();

router.use(requireAuth);

router.post('/', validateRequest(submitCodeSchema), submissionController.submit);
router.get('/', submissionController.getUserSubmissions);
router.get('/:id', submissionController.getSubmissionDetails);

export default router;
