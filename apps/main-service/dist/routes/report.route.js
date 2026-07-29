"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const report_validator_1 = require("../validators/report.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.post('/', 
/* #swagger.tags = ['Reports']
   #swagger.summary = 'Create a report (user)'
   #swagger.description = 'Submit a report (e.g., abuse, problem issue) against a resource. Requires authentication.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = {
     required: true,
     content: {
       'application/json': {
         schema: {
           type: 'object',
           properties: {
             targetId: { type: 'string' },
             targetType: {
               type: 'string',
               description: 'e.g., problem, submission, comment'
             },
             reason: { type: 'string' },
             details: { type: 'string' }
           },
           required: ['targetId', 'targetType', 'reason']
         },
         example: {
           targetId: 'prob_1',
           targetType: 'problem',
           reason: 'Plagiarism',
           details: 'This solution seems copied.'
         }
       }
     }
   }
   #swagger.responses[201] = {
     description: 'Report created',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Report submitted',
           data: {
             reportId: 'r_1',
             status: 'PENDING'
           }
         }
       }
     }
   }
*/
(0, validate_middleware_1.validateRequest)(report_validator_1.createReportSchema), report_controller_1.reportController.createReport);
router.get('/', 
/* #swagger.tags = ['Reports']
   #swagger.summary = 'Get reports for admin'
   #swagger.description = 'Admin-only endpoint to list reports with optional filters and pagination.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['status'] = {
     in: 'query',
     description: 'Filter by status',
     schema: {
       type: 'string',
       enum: ['PENDING', 'RESOLVED', 'REJECTED']
     }
   }
   #swagger.parameters['page'] = {
     in: 'query',
     description: 'Page number',
     schema: {
       type: 'integer',
       default: 1
     }
   }
   #swagger.parameters['limit'] = {
     in: 'query',
     description: 'Items per page',
     schema: {
       type: 'integer',
       default: 20
     }
   }
   #swagger.responses[200] = {
     description: 'Reports list',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Reports fetched',
           data: {
             items: [
               {
                 reportId: 'r_1',
                 targetId: 'prob_1',
                 targetType: 'problem',
                 reason: 'abuse',
                 status: 'PENDING',
                 createdAt: '2026-06-12T12:00:00Z'
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
report_controller_1.reportController.getReports);
router.put('/:reportId', 
/* #swagger.tags = ['Reports']
   #swagger.summary = 'Update report status (admin)'
   #swagger.description = 'Change status of a report (e.g., RESOLVED, REJECTED). Admin only.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['reportId'] = {
     in: 'path',
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
             status: {
               type: 'string',
               enum: ['PENDING', 'RESOLVED', 'REJECTED']
             },
             note: { type: 'string' }
           },
           required: ['status']
         },
         example: {
           status: 'RESOLVED',
           note: 'Issue addressed'
         }
       }
     }
   }
   #swagger.responses[200] = {
     description: 'Report updated',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Report updated',
           data: {
             reportId: 'r_1',
             status: 'RESOLVED'
           }
         }
       }
     }
   }
*/
auth_middleware_1.requireAdmin, (0, validate_middleware_1.validateRequest)(report_validator_1.updateReportSchema), report_controller_1.reportController.updateReportStatus);
exports.default = router;
