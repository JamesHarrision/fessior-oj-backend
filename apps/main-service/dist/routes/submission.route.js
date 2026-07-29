"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submission_controller_1 = require("../controllers/submission.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const submission_validator_1 = require("../validators/submission.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.post('/', 
/* #swagger.tags = ['Submissions']
   #swagger.summary = 'Submit code for a problem'
   #swagger.description = 'Create a submission for a problem; code is queued for judging.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = {
     required: true,
     content: {
       'application/json': {
         schema: {
           type: 'object',
           properties: {
             problemId: { type: 'string' },
             language: { type: 'string' },
             code: { type: 'string' },
             timeLimit: { type: 'number' }
           },
           required: ['problemId', 'language', 'code']
         },
         example: {
           problemId: 'prob_1',
           language: 'cpp',
           code: '#include <bits/stdc++.h>\nint main(){}',
           timeLimit: 2.0
         }
       }
     }
   }
   #swagger.responses[201] = {
     description: 'Submission created',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Submission queued',
           data: {
             submissionId: 's_1',
             status: 'queued'
           }
         }
       }
     }
   }
   #swagger.responses[400] = {
     description: 'Validation error',
     content: {
       'application/json': {
         example: {
           status: 'Error',
           message: 'Invalid request'
         }
       }
     }
   }
*/
(0, validate_middleware_1.validateRequest)(submission_validator_1.submitCodeSchema), submission_controller_1.submissionController.submit);
router.post('/run', 
/* #swagger.tags = ['Submissions']
   #swagger.summary = 'Run code (sandbox)'
   #swagger.description = 'Execute code ad-hoc without creating a persistent submission. Useful for quick testing.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = {
     required: true,
     content: {
       'application/json': {
         schema: {
           type: 'object',
           properties: {
             language: { type: 'string' },
             code: { type: 'string' },
             stdin: { type: 'string' },
             timeLimit: { type: 'number' }
           },
           required: ['language', 'code']
         },
         example: {
           language: 'python',
           code: "print(input())",
           stdin: "hello"
         }
       }
     }
   }
   #swagger.responses[200] = {
     description: 'Run result',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Run completed',
           data: {
             stdout: 'hello\n',
             stderr: '',
             exitCode: 0,
             time: 0.12,
             memory: 1024
           }
         }
       }
     }
   }
*/
submission_controller_1.submissionController.runCode);
router.get('/', 
/* #swagger.tags = ['Submissions']
   #swagger.summary = 'List submissions for current user'
   #swagger.description = 'Return paginated submissions created by the authenticated user.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['page'] = {
     in: 'query',
     schema: {
       type: 'integer',
       default: 1
     }
   }
   #swagger.parameters['limit'] = {
     in: 'query',
     schema: {
       type: 'integer',
       default: 20
     }
   }
   #swagger.parameters['problemId'] = {
     in: 'query',
     schema: {
       type: 'string'
     }
   }
   #swagger.parameters['status'] = {
     in: 'query',
     schema: {
       type: 'string'
     },
     description: 'Filter by verdict/status'
   }
   #swagger.responses[200] = {
     description: 'User submissions',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Submissions fetched',
           data: {
             items: [
               {
                 submissionId: 's_1',
                 problemId: 'prob_1',
                 status: 'accepted',
                 language: 'cpp',
                 time: 0.12,
                 memory: 1024
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
submission_controller_1.submissionController.getUserSubmissions);
router.get('/:id', 
/* #swagger.tags = ['Submissions']
   #swagger.summary = 'Get submission details'
   #swagger.description = 'Get detailed result for a submission including per-testcase results.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['id'] = {
     in: 'path',
     required: true,
     schema: { type: 'string' }
   }
   #swagger.responses[200] = {
     description: 'Submission details',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Submission fetched',
           data: {
             submissionId: 's_1',
             problemId: 'prob_1',
             status: 'accepted',
             language: 'cpp',
             time: 0.12,
             memory: 1024,
             tests: [
               {
                 caseId: 1,
                 verdict: 'accepted',
                 time: 0.03,
                 memory: 256
               }
             ]
           }
         }
       }
     }
   }
   #swagger.responses[404] = {
     description: 'Not found',
     content: {
       'application/json': {
         example: {
           status: 'Error',
           message: 'Submission not found'
         }
       }
     }
   }
*/
submission_controller_1.submissionController.getSubmissionDetails);
exports.default = router;
