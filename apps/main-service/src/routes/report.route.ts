import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createReportSchema, updateReportSchema } from '../validators/report.validator';

const router = Router();

router.use(requireAuth);

router.post('/',
	/* #swagger.tags = ['Reports']
		 #swagger.summary = 'Create a report (user)'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateReport' } } } }
	*/
	validateRequest(createReportSchema), reportController.createReport);

router.get('/',
	/* #swagger.tags = ['Reports']
		 #swagger.summary = 'Get reports for admin'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	reportController.getReports);

router.put('/:reportId',
	/* #swagger.tags = ['Reports']
		 #swagger.summary = 'Update report status (admin)'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['reportId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	requireAdmin, validateRequest(updateReportSchema), reportController.updateReportStatus);

export default router;
