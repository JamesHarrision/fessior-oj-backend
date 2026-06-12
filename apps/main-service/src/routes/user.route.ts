import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { updateMeSchema } from '../validators/user.validator';
import * as userController from '../controllers/user.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * GET /api/v1/users/:username
 * Get public user profile by username
 */
router.get('/:username', (req, res, next) => {
  /* #swagger.tags = ['User']
     #swagger.summary = 'Get public user profile'
     #swagger.description = 'Returns public profile information of a user by username. Does not require authentication.'
     #swagger.parameters['username'] = {
       in: 'path',
       required: true,
       description: 'Username of the user to retrieve',
       type: 'string',
       example: 'john_doe'
     }
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
               avatar_url: null,
               role: 'USER',
               elo_rating: 1200,
               streak_count: 5,
               max_streak: 10,
               code_coins: 100,
               bio: 'I love coding!',
               full_name: 'John Doe',
               created_at: '2024-01-01T00:00:00.000Z'
             }
           }
         }
       }
     }
     #swagger.responses[404] = {
       description: 'User not found'
     }
  */
  userController.getUserByUsername(req, res, next);
});

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

/**
 * PATCH /api/v1/users/me
 * Update current user profile
 */
router.patch('/me', validateRequest(updateMeSchema), (req, res, next) => {
  /* #swagger.tags = ['User']
     #swagger.summary = 'Update current user profile'
     #swagger.description = 'Updates the profile information (full_name, bio) of the authenticated user.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: {
             type: 'object',
             properties: {
               full_name: { type: 'string', maxLength: 100, description: 'User full name', example: 'John Doe' },
               bio: { type: 'string', maxLength: 500, description: 'Short biography', example: 'I love coding and solving problems!' }
             }
           },
           example: {
             full_name: 'John Doe',
             bio: 'I love coding and solving problems!'
           }
         }
       }
     }
     #swagger.responses[200] = {
       description: 'User profile updated successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               status: { type: 'string', example: 'Success' },
               message: { type: 'string', example: 'User profile updated successfully' },
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
                   created_at: { type: 'string', format: 'date-time' },
                   updated_at: { type: 'string', format: 'date-time' }
                 }
               }
             }
           },
           example: {
             status: 'Success',
             message: 'User profile updated successfully',
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
               bio: 'I love coding and solving problems!',
               full_name: 'John Doe',
               created_at: '2024-01-01T00:00:00.000Z',
               updated_at: '2024-01-15T00:00:00.000Z'
             }
           }
         }
       }
     }
     #swagger.responses[400] = {
       description: 'Validation error - Invalid input data'
     }
     #swagger.responses[401] = {
       description: 'Unauthorized - Invalid or missing token'
     }
  */
  userController.updateMe(req, res, next);
});

router.post('/me/avatar', upload.single('avatar'), (req, res, next) => {
  /* #swagger.tags = ['User']
     #swagger.summary = 'Upload user avatar'
     #swagger.description = 'Upload an image file to set as user avatar. Supports JPEG, PNG, JPG, WEBP (max 5MB).'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.consumes = ['multipart/form-data']
     #swagger.requestBody = {
       required: true,
       content: {
         'multipart/form-data': {
           schema: {
             type: 'object',
             properties: {
               avatar: {
                 type: 'string',
                 format: 'binary',
                 description: 'Image file (JPEG, PNG, JPG, WEBP)'
               }
             },
             required: ['avatar']
           }
         }
       }
     }
     #swagger.responses[200] = {
       description: 'Avatar uploaded successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               status: { type: 'string', example: 'Success' },
               message: { type: 'string', example: 'Avatar uploaded successfully' },
               data: {
                 type: 'object',
                 properties: {
                   id: { type: 'string' },
                   username: { type: 'string' },
                   avatar_url: { type: 'string' }
                 }
               }
             }
           }
         }
       }
     }
     #swagger.responses[400] = {
       description: 'No file uploaded or invalid file type'
     }
     #swagger.responses[401] = {
       description: 'Unauthorized'
     }
  */
  userController.uploadAvatar(req, res, next);
});

export default router;