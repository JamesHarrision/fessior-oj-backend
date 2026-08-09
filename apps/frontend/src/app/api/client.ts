import {
  AuthRepository,
  HttpClient,
  ProblemRepository,
  SubmissionRepository,
  UserRepository,
  RoomRepository,
  MatchRepository,
  LeaderboardRepository,
  CommentRepository,
} from '@ocj/api';
import { useAuthStore } from '../../features/auth/auth.store';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:6868/api/v1';

export const httpClient = new HttpClient({
  baseUrl,
  getAccessToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: () => useAuthStore.getState().clear(),
});

// ── Repositories ──
export const authRepository = new AuthRepository(httpClient);
export const problemRepository = new ProblemRepository(httpClient);
export const submissionRepository = new SubmissionRepository(httpClient);
export const userRepository = new UserRepository(httpClient);
export const roomRepository = new RoomRepository(httpClient);
export const matchRepository = new MatchRepository(httpClient);
export const leaderboardRepository = new LeaderboardRepository(httpClient);
export const commentRepository = new CommentRepository(httpClient);
