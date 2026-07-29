"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const match_history_controller_1 = require("../controllers/match_history.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/history', 
/* #swagger.tags = ['MatchHistory']
   #swagger.summary = 'Get match history for current user'
   #swagger.description = 'Return a paginated list of past matches for the authenticated user.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['page'] = {
     in: 'query',
     schema: {
       type: 'integer',
       default: 1
     },
     description: 'Page number'
   }
   #swagger.parameters['limit'] = {
     in: 'query',
     schema: {
       type: 'integer',
       default: 20
     },
     description: 'Items per page'
   }
   #swagger.responses[200] = {
     description: 'Match history',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Match history fetched',
           data: {
             items: [
               {
                 matchId: 'm1',
                 opponentId: 'user_2',
                 result: 'WIN',
                 score: 1200,
                 playedAt: '2026-06-12T11:00:00Z'
               }
             ],
             total: 1,
             page: 1,
             limit: 20
           }
         }
       }
     }
   }
*/
auth_middleware_1.requireAuth, match_history_controller_1.matchHistoryController.getHistory);
router.get('/active', 
/* #swagger.tags = ['MatchHistory']
   #swagger.summary = 'Get active match for current user'
   #swagger.description = 'Returns the pending match the user is currently participating in.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.responses[200] = {
     description: 'Active match',
   }
*/
auth_middleware_1.requireAuth, match_history_controller_1.matchHistoryController.getActiveMatch);
router.get('/:matchId', 
/* #swagger.tags = ['MatchHistory']
   #swagger.summary = 'Get details for a match'
   #swagger.description = 'Return detailed information for a specific match including moves, verdicts, and participants.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['matchId'] = {
     in: 'path',
     required: true,
     schema: { type: 'string' }
   }
   #swagger.responses[200] = {
     description: 'Match details',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Match details fetched',
           data: {
             matchId: 'm1',
             participants: [
               {
                 userId: 'user_1',
                 username: 'alice'
               },
               {
                 userId: 'user_2',
                 username: 'bob'
               }
             ],
             result: 'WIN',
             moves: [],
             playedAt: '2026-06-12T11:00:00Z'
           }
         }
       }
     }
   }
*/
auth_middleware_1.requireAuth, match_history_controller_1.matchHistoryController.getMatchDetails);
router.delete('/:matchId', 
/* #swagger.tags = ['MatchHistory']
   #swagger.summary = 'Delete match (admin)'
   #swagger.description = 'Remove a match record. Admin only.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['matchId'] = {
     in: 'path',
     required: true,
     schema: { type: 'string' }
   }
   #swagger.responses[200] = {
     description: 'Match deleted',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Match deleted'
         }
       }
     }
   }
*/
auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, match_history_controller_1.matchHistoryController.deleteMatch);
exports.default = router;
