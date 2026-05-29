import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createReportSchema, updateReportSchema } from '../validators/report.validator';

const router = Router();

router.use(requireAuth);

router.post('/', validateRequest(createReportSchema), reportController.createReport);
router.get('/', reportController.getReports);
router.put('/:reportId', requireAdmin, validateRequest(updateReportSchema), reportController.updateReportStatus);

export default router;
