import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validator';

const router = Router();

// Public route to view comments
router.get('/', commentController.getComments);

// Auth-required routes
router.use(requireAuth);
router.post('/', validateRequest(createCommentSchema), commentController.createComment);
router.put('/:commentId', validateRequest(updateCommentSchema), commentController.updateComment);
router.delete('/:commentId', commentController.deleteComment);
router.post('/:commentId/like', commentController.toggleLike);

export default router;
