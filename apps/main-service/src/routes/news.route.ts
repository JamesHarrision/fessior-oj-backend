import { Router } from 'express';
import { newsController } from '../controllers/news.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createNewsSchema } from '../validators/news.validator';

const router = Router();

// Public route to get news
router.get('/', newsController.getNews);

// Admin routes
router.use(requireAuth);
router.post('/', validateRequest(createNewsSchema), newsController.createNews);
router.delete('/:newsId', newsController.deleteNews);

export default router;
