"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaderboard_controller_1 = require("../controllers/leaderboard.controller");
const router = (0, express_1.Router)();
router.get('/', 
/* #swagger.tags = ['Leaderboard']
     #swagger.summary = 'Get global leaderboard'
     #swagger.description = 'Return the global leaderboard ordered by points or other scoring metric.'
     #swagger.parameters['limit'] = { in: 'query', schema: { type: 'integer', default: 50 }, description: 'Limit results' }
     #swagger.parameters['page'] = { in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' }
     #swagger.parameters['period'] = { in: 'query', schema: { type: 'string', enum: ['all','monthly','weekly','daily'], default: 'all' }, description: 'Leaderboard period filter' }
     #swagger.responses[200] = {
         description: 'Leaderboard returned',
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
                                             rank: { type: 'integer' },
                                             userId: { type: 'string' },
                                             username: { type: 'string' },
                                             name: { type: 'string' },
                                             points: { type: 'number' },
                                             solved: { type: 'integer' }
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
                 example: { status: 'Success', message: 'Leaderboard fetched', data: { items: [ { rank: 1, userId: 'user_1', username: 'alice', name: 'Alice', points: 1234, solved: 42 } ], total: 1, page: 1, limit: 50 } }
             }
         }
     }
*/
leaderboard_controller_1.leaderboardController.getLeaderboard);
exports.default = router;
