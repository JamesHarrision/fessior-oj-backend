"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const comment_validator_1 = require("../validators/comment.validator");
const router = (0, express_1.Router)();
// Public: list comments
router.get('/', 
/* #swagger.tags = ['Comments']
     #swagger.summary = 'List comments for an entity'
     #swagger.description = 'Retrieve comments filtered by entity id/type with optional pagination.'
     #swagger.parameters['entityId'] = { in: 'query', description: 'Filter by entity id (e.g., problemId or submissionId)', schema: { type: 'string' } }
     #swagger.parameters['entityType'] = { in: 'query', description: 'Type of entity: problem|submission', schema: { type: 'string', enum: ['problem','submission'] } }
     #swagger.parameters['page'] = { in: 'query', description: 'Page number for pagination', schema: { type: 'integer', default: 1 } }
     #swagger.parameters['limit'] = { in: 'query', description: 'Items per page', schema: { type: 'integer', default: 20 } }
     #swagger.responses[200] = {
         description: 'List of comments',
         content: {
             'application/json': {
                 schema: {
                     type: 'object',
                     properties: {
                         status: { type: 'string' },
                         message: { type: 'string' },
                         data: {
                             type: 'object',
                             properties: {
                                 items: {
                                     type: 'array',
                                     items: {
                                         type: 'object',
                                         properties: {
                                             id: { type: 'string' },
                                             authorId: { type: 'string' },
                                             content: { type: 'string' },
                                             parentId: { type: 'string', nullable: true },
                                             likesCount: { type: 'integer' },
                                             createdAt: { type: 'string', format: 'date-time' }
                                         }
                                     }
                                 },
                                 total: { type: 'integer' },
                                 page: { type: 'integer' },
                                 limit: { type: 'integer' }
                             }
                         }
                     }
                 },
                 example: { status: 'Success', message: 'Comments fetched', data: { items: [ { id: 'c1', authorId: 'user_1', content: 'Nice problem', parentId: null, likesCount: 2, createdAt: '2026-06-12T12:00:00Z' } ], total: 1, page: 1, limit: 20 } }
             }
         }
     }
*/
comment_controller_1.commentController.getComments);
// Require authentication for the following routes
router.use(auth_middleware_1.requireAuth);
router.post('/', 
/* #swagger.tags = ['Comments']
     #swagger.summary = 'Create a comment'
     #swagger.description = 'Create a comment attached to a problem or submission. Requires authentication.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.requestBody = {
         required: true,
         content: {
             'application/json': {
                 schema: {
                     type: 'object',
                     properties: {
                         entityId: { type: 'string', description: 'ID of the parent entity (problem or submission)' },
                         entityType: { type: 'string', enum: ['problem','submission'], description: 'Type of parent entity' },
                         content: { type: 'string', description: 'Comment text' },
                         parentId: { type: 'string', description: 'Optional parent comment id for replies' }
                     },
                     required: ['entityId','entityType','content']
                 },
                 example: { entityId: 'prob_123', entityType: 'problem', content: 'Great explanation!', parentId: null }
             }
         }
     }
     #swagger.responses[201] = {
         description: 'Comment created',
         content: { 'application/json': { example: { status: 'Success', message: 'Comment created', data: { id: 'c1', authorId: 'user_1', content: 'Great explanation!', createdAt: '2026-06-12T12:00:00Z' } } } }
*/
(0, validate_middleware_1.validateRequest)(comment_validator_1.createCommentSchema), comment_controller_1.commentController.createComment);
router.put('/:commentId', 
/* #swagger.tags = ['Comments']
     #swagger.summary = 'Update a comment'
     #swagger.description = 'Edit your own comment. Requires authentication.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['commentId'] = {
        in: 'path',
        description: 'ID of the comment to update',
        required: true,
        schema: { type: 'string' }
    }
     #swagger.requestBody = {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        content: { type: 'string' }
                    },
                    required: ['content']
                },
                example: { content: 'Updated text' }
            }
        }
     }
     #swagger.responses[200] = {
        description: 'Comment updated',
        content: {
            'application/json': {
                example: {
                    status: 'Success',
                    message: 'Comment updated successfully',
                    data: {
                        id: 'c1',
                        content: 'Updated text'
                    }
                }
            }
        }
     }
*/
(0, validate_middleware_1.validateRequest)(comment_validator_1.updateCommentSchema), comment_controller_1.commentController.updateComment);
router.delete('/:commentId', 
/* #swagger.tags = ['Comments']
#swagger.summary = 'Delete a comment'
#swagger.description = 'Delete your own comment. Requires authentication.'
#swagger.security = [{ "bearerAuth": [] }]
#swagger.parameters['commentId'] = {
    in: 'path',
    description: 'ID of the comment to delete',
    required: true,
    schema: { type: 'string' }
}
#swagger.responses[200] = {
    description: 'Comment deleted',
    content: {
    'application/json': {
        example: {
        status: 'Success',
        message: 'Comment deleted successfully'
        }
    }
    }
}
*/
comment_controller_1.commentController.deleteComment);
router.post('/:commentId/like', 
/* #swagger.tags = ['Comments']
#swagger.summary = 'Toggle like on a comment'
#swagger.description = 'Like or unlike a comment. Returns new like status and count. Requires authentication.'
#swagger.security = [{ "bearerAuth": [] }]
#swagger.parameters['commentId'] = {
    in: 'path',
    description: 'ID of the comment to like/unlike',
    required: true,
    schema: { type: 'string' }
}
#swagger.responses[200] = {
    description: 'Like toggled',
    content: {
    'application/json': {
        example: {
        status: 'Success',
        message: 'Like toggled',
        data: {
            liked: true,
            likesCount: 3
        }
        }
    }
    }
}
*/
comment_controller_1.commentController.toggleLike);
exports.default = router;
