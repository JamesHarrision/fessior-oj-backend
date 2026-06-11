import { authEndpoints } from './endpoints/authEndpoints';
import { problemEndpoints } from './endpoints/problemEndpoints';
import { submissionEndpoints } from './endpoints/submissionEndpoints';
import { aiEndpoints } from './endpoints/aiEndpoints';
import { roomEndpoints } from './endpoints/roomEndpoints';
import { contestEndpoints } from './endpoints/contestEndpoints';
import { socialEndpoints } from './endpoints/socialEndpoints';

export interface ApiEndpoint {
  id: string;
  name: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiresAuth?: boolean;
  defaultBody?: string;
  pathParams?: string[];
}

export const API_LIST: ApiEndpoint[] = [
  ...authEndpoints,
  ...problemEndpoints,
  ...submissionEndpoints,
  ...aiEndpoints,
  ...roomEndpoints,
  ...contestEndpoints,
  ...socialEndpoints
];
