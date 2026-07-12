import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/roadmap', (req, res, next) => {
  /* #swagger.tags = ['AI Features']
     #swagger.summary = 'Generate personalized DSA roadmap'
     #swagger.description = 'Generate a personalized DSA learning roadmap (JSON) from user questionnaire or skill profile.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: {
             type: 'object',
             properties: {
               skillLevel: { type: 'string', enum: ['BEGINNER','INTERMEDIATE','ADVANCED'], description: 'User skill level' },
               focusArea: { type: 'string', description: 'Primary topic to focus on, e.g. Recursion, DP, Trees' },
               goals: { type: 'string', description: 'Optional learning goals or constraints' }
             },
             required: ['skillLevel']
           },
           example: {
             skillLevel: 'BEGINNER',
             focusArea: 'Recursion',
             goals: 'Prepare for 3-month interview roadmap'
           }
         }
       }
     }
     #swagger.responses[200] = {
       description: 'Roadmap generated successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               status: { type: 'string' },
               data: {
                 type: 'object',
                 properties: {
                   title: { type: 'string' },
                   description: { type: 'string' },
                   nodes: {
                     type: 'array',
                     items: {
                       type: 'object',
                       properties: {
                         id: { type: 'string' },
                         title: { type: 'string' },
                         description: { type: 'string' },
                         estimatedWeeks: { type: 'number' },
                         difficulty: { type: 'string', enum: ['EASY','MEDIUM','HARD'] },
                         recommendedProblems: { type: 'array', items: { type: 'string' } }
                       }
                     }
                   }
                 }
               }
             }
           },
           example: {
             status: 'Success',
             data: {
               title: 'Personalized DSA Roadmap',
               description: 'A structured path generated based on your current knowledge profile.',
               nodes: [
                 { id: 'node-1', title: 'Arrays', description: 'Learn arrays', estimatedWeeks: 1, difficulty: 'EASY', recommendedProblems: ['two-sum'] }
               ]
             }
           }
         }
       }
     }
  */
  aiController.generateRoadmap(req, res, next);
});

router.post('/feedback/:submissionId', (req, res, next) => {
  /* #swagger.tags = ['AI Features']
     #swagger.summary = 'AI mock interview feedback for a submission'
     #swagger.description = 'Return AI-generated interview-style feedback for a submission by its ID.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['submissionId'] = {
       in: 'path',
       description: 'ID of the Submission to analyze',
       required: true,
       schema: { type: 'string' }
     }
     #swagger.responses[200] = {
       description: 'Feedback generated successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               status: { type: 'string' },
               data: { type: 'object', properties: { feedback: { type: 'string' } } }
             }
           },
           example: {
             status: 'Success',
             data: { feedback: 'The AI feedback text...' }
           }
         }
       }
     }
     #swagger.responses[404] = {
       description: 'Submission or Problem not found',
       content: { 'application/json': { example: { status: 'Error', message: 'Submission not found' } } }
     }
  */
  aiController.generateMockInterviewFeedback(req, res, next);
});

router.post('/debug/:submissionId', (req, res, next) => {
  /* #swagger.tags = ['AI Features']
     #swagger.summary = 'AI explain failure for a submission'
     #swagger.description = 'Return AI-generated explanation for a failed submission.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['submissionId'] = {
       in: 'path',
       description: 'ID of the Submission to debug',
       required: true,
       schema: { type: 'string' }
     }
  */
  aiController.explainFailure(req, res, next);
});

router.post('/interview/chat/:historyId', (req, res, next) => {
  /* #swagger.tags = ['AI Features']
     #swagger.summary = 'Chat with AI Mentor in an ongoing mock interview'
     #swagger.description = 'Send a message to continue the mock interview chat.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['historyId'] = {
       in: 'path',
       description: 'ID of the AI History item (type INTERVIEW)',
       required: true,
       schema: { type: 'string' }
     }
  */
  aiController.chatMockInterview(req, res, next);
});

router.get('/history', (req, res, next) => {
  /* #swagger.tags = ['AI Features']
     #swagger.summary = 'Get AI conversation history'
     #swagger.description = 'Return a list of previous AI roadmap and interview feedbacks.'
     #swagger.security = [{ "bearerAuth": [] }]
  */
  aiController.getHistory(req, res, next);
});

export default router;