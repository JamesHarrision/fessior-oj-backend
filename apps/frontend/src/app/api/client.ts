import {
  AuthRepository,
  HttpClient,
  ProblemRepository,
  SubmissionRepository,
  UserRepository,
  ContestRepository,
  RoomRepository,
  MatchRepository,
  LeaderboardRepository,
  CommentRepository,
  FriendRepository,
  ShopRepository,
  NotificationRepository,
  ReportRepository,
  AiRepository,
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
export const contestRepository = new ContestRepository(httpClient);
export const roomRepository = new RoomRepository(httpClient);
export const matchRepository = new MatchRepository(httpClient);
export const leaderboardRepository = new LeaderboardRepository(httpClient);
export const commentRepository = new CommentRepository(httpClient);
export const friendRepository = new FriendRepository(httpClient);
export const shopRepository = new ShopRepository(httpClient);
export const notificationRepository = new NotificationRepository(httpClient);
export const reportRepository = new ReportRepository(httpClient);
export const aiRepository = new AiRepository(httpClient);
