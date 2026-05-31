export interface ApiEndpoint {
  id: string;
  name: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
  defaultBody?: string;
  pathParams?: string[];
}

export const API_LIST: ApiEndpoint[] = [
  {
    id: 'auth-register',
    name: 'Register User',
    category: 'Auth',
    method: 'POST',
    path: '/api/v1/auth/register',
    description: 'Register a new user account',
    requiresAuth: false,
    defaultBody: JSON.stringify({
      username: 'newuser123',
      email: 'newuser@example.com',
      password: 'Password123!'
    }, null, 2)
  },
  {
    id: 'auth-login',
    name: 'Login User',
    category: 'Auth',
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'Authenticate user and receive token',
    requiresAuth: false,
    defaultBody: JSON.stringify({
      email: 'newuser@example.com',
      password: 'Password123!'
    }, null, 2)
  },
  {
    id: 'problems-tags',
    name: 'Get Tags',
    category: 'Problems',
    method: 'GET',
    path: '/api/v1/problems/tags',
    description: 'Retrieve all problem category tags',
    requiresAuth: false
  },
  {
    id: 'problems-list',
    name: 'List Problems',
    category: 'Problems',
    method: 'GET',
    path: '/api/v1/problems',
    description: 'Get list of competitive programming problems',
    requiresAuth: false
  },
  {
    id: 'problems-detail',
    name: 'Get Problem Details',
    category: 'Problems',
    method: 'GET',
    path: '/api/v1/problems/:slug',
    description: 'Retrieve detailed information for a single problem by slug',
    requiresAuth: false,
    pathParams: ['slug']
  },
  {
    id: 'submissions-submit',
    name: 'Submit Code',
    category: 'Submissions',
    method: 'POST',
    path: '/api/v1/submissions',
    description: 'Submit solution for a problem code execution',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      problemId: '',
      language: 'python',
      code: 'print("Hello World")'
    }, null, 2)
  },
  {
    id: 'submissions-list',
    name: 'Get Submissions',
    category: 'Submissions',
    method: 'GET',
    path: '/api/v1/submissions',
    description: 'Retrieve list of all submissions',
    requiresAuth: true
  },
  {
    id: 'ai-roadmap',
    name: 'Generate Roadmap',
    category: 'AI',
    method: 'POST',
    path: '/api/v1/ai/roadmap',
    description: 'Generate customized DSA learning roadmap using AI',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      topic: 'Dynamic Programming',
      level: 'INTERMEDIATE'
    }, null, 2)
  },
  {
    id: 'ai-feedback',
    name: 'AI Mock Interview Feedback',
    category: 'AI',
    method: 'POST',
    path: '/api/v1/ai/feedback/:submissionId',
    description: 'Request AI feedback and analysis on a submission code',
    requiresAuth: true,
    pathParams: ['submissionId']
  },
  {
    id: 'rooms-active',
    name: 'Get Active Rooms',
    category: 'Rooms',
    method: 'GET',
    path: '/api/v1/rooms/active',
    description: 'Retrieve list of active matchmaking rooms',
    requiresAuth: true
  },
  {
    id: 'friends-list',
    name: 'Get Friends & Status',
    category: 'Friends',
    method: 'GET',
    path: '/api/v1/friends',
    description: 'List user friends and their online status',
    requiresAuth: true
  },
  {
    id: 'shop-items',
    name: 'Get Shop Items',
    category: 'Shop',
    method: 'GET',
    path: '/api/v1/shop/items',
    description: 'Retrieve list of available items in the shop',
    requiresAuth: false
  },
  {
    id: 'shop-inventory',
    name: 'Get Inventory',
    category: 'Shop',
    method: 'GET',
    path: '/api/v1/shop/inventory',
    description: 'Get list of owned user inventory items',
    requiresAuth: true
  },
  {
    id: 'notifications-list',
    name: 'Get Notifications',
    category: 'Notifications',
    method: 'GET',
    path: '/api/v1/notifications',
    description: 'Retrieve list of user notifications',
    requiresAuth: true
  }
];
