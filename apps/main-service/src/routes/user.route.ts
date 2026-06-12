import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/v1/users/me
 * Get current user profile
 */
router.get('/me', (req, res, next) => {
  /* #swagger.tags = ['User']
     #swagger.summary = 'Get current user profile'
     #swagger.description = 'Returns the profile information of the authenticated user.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.responses[200] = {
       description: 'User profile retrieved successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               status: { type: 'string', example: 'Success' },
               message: { type: 'string', example: 'User profile retrieved successfully' },
               data: {
                 type: 'object',
                 properties: {
                   id: { type: 'string' },
                   username: { type: 'string' },
                   email: { type: 'string' },
                   avatar_url: { type: 'string', nullable: true },
                   role: { type: 'string', enum: ['USER', 'ADMIN'] },
                   elo_rating: { type: 'number' },
                   streak_count: { type: 'number' },
                   max_streak: { type: 'number' },
                   code_coins: { type: 'number' },
                   bio: { type: 'string', nullable: true },
                   full_name: { type: 'string', nullable: true },
                   created_at: { type: 'string', format: 'date-time' }
                 }
               }
             }
           },
           example: {
             status: 'Success',
             message: 'User profile retrieved successfully',
             data: {
               id: 'uuid-123',
               username: 'john_doe',
               email: 'john@example.com',
               avatar_url: null,
               role: 'USER',
               elo_rating: 1200,
               streak_count: 5,
               max_streak: 10,
               code_coins: 100,
               bio: 'I love coding',
               full_name: 'John Doe',
               created_at: '2024-01-01T00:00:00.000Z'
             }
           }
         }
       }
     }
     #swagger.responses[401] = {
       description: 'Unauthorized - Invalid or missing token'
     }
  */
  userController.getMe(req, res, next);
});

export default router;