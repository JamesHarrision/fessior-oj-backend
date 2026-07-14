/**
 * Bridge file — re-exports old `api` object shape using new @ocj/api repositories.
 *
 * Maps repository calls → old `{ success, data }` format.
 * This file exists to avoid breaking 30+ legacy components during Phase 1-2 migration.
 * Will be removed once all views are refactored to use React Query + repositories directly.
 *
 * NOTE: HttpClient unwraps `{ status, data }` → returns `data` directly on success,
 *       and throws ApiError on failure. Our `wrap()` catches errors → `{ success: false }`.
 */

import {
  httpClient,
  problemRepository,
  submissionRepository,
  leaderboardRepository,
  shopRepository,
  friendRepository,
  contestRepository,
  roomRepository,
  commentRepository,
  reportRepository,
  aiRepository,
  notificationRepository,
  matchRepository,
  userRepository,
} from '../app/api/client';

// ── Helper: try/catch repository call → { success, data } ──
 
async function wrap<T>(promise: Promise<any>): Promise<{ success: boolean; data: T | undefined }> {
  try {
    // Repositories return unwrapped data (HttpClient extracts .data), or throw ApiError
    const data = (await promise) as T;
    return { success: true, data };
  } catch {
    return { success: false, data: undefined };
  }
}

// ── Raw HTTP helpers (for endpoints not yet in repositories) ──
async function rawGet<T>(path: string) {
  return wrap<T>(httpClient.request('GET', path));
}
async function rawPost<T>(path: string, body?: unknown) {
  return wrap<T>(httpClient.request('POST', path, { body }));
}

async function rawDelete(path: string) {
  return wrap<void>(httpClient.request('DELETE', path));
}

// ── API object ──
export const api = {
  // =========================================================
  // Auth & User
  // =========================================================
   
  getMe: () => wrap<any>(userRepository.getProfile('me')),
   
  getCurrentUser: () => wrap<any>(userRepository.getProfile('me')),
   
  getSessions: () => rawGet<any>('/auth/sessions'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    rawPost<{ message: string }>('/auth/change-password', data),
  revokeSession: (sessionId: string) => rawDelete(`/auth/sessions/${sessionId}`),
  revokeAllSessions: () => rawDelete('/auth/sessions'),
   
  updateProfile: (data: Record<string, unknown>) => wrap<any>(userRepository.updateProfile(data)),
  
  // Public Profile
  getUserProfile: (username: string) => rawGet<any>(`/users/profile/${username}`),
  getUserProfileSubmissions: (username: string) => rawGet<any>(`/users/profile/${username}/submissions`),
  getUserProfileTagStats: (username: string) => rawGet<any>(`/users/profile/${username}/tag-stats`),
  getUserProfileEloHistory: (username: string) => rawGet<any>(`/users/profile/${username}/elo-history`),
  getUserProfileStreak: (username: string) => rawGet<any>(`/users/profile/${username}/streak`),

  // =========================================================
  // Problems
  // =========================================================
   
  getProblems: () => wrap<any>(problemRepository.getProblems()),
   
  getProblemDetail: (slug: string) => wrap<any>(problemRepository.getProblem(slug)),
   
  getProblemTags: () => wrap<any>(problemRepository.getTags()),
  createProblem: (data: Record<string, unknown>) =>
     
    wrap<any>(problemRepository.createProblem(data as never)),
  updateProblem: (id: string, data: Record<string, unknown>) =>
     
    wrap<any>(problemRepository.updateProblem(id, data as never)),
  deleteProblem: (id: string) => wrap(problemRepository.deleteProblem(id)),

  // Tag management (admin)
   
  createTag: (data: Record<string, unknown>) => rawPost<any>('/problems/tags', data),

  // Testcase management
   
  getTestcases: (problemId: string, isExample?: boolean) => wrap<any>(problemRepository.getTestcases(problemId, isExample)),
  addTestcase: (problemId: string, data: Record<string, unknown>) =>
     
    wrap<any>(problemRepository.createTestcase(problemId, data)),
  deleteTestcase: (problemId: string, testcaseId: string) =>
    wrap(problemRepository.deleteTestcase(problemId, testcaseId)),

  // =========================================================
  // Submissions
  // =========================================================
  submitCode: (data: any) =>
     
    wrap<any>(submissionRepository.submit(data)),
  runCode: (data: any) =>
     
    wrap<any>(submissionRepository.run(data)),
   
  getSubmissionDetail: (id: string) => wrap<any>(submissionRepository.getSubmission(id)),
  getSubmissions: (params?: Record<string, unknown>) =>
     
    wrap<any>(submissionRepository.getSubmissions(params as never)),

  // =========================================================
  // Leaderboard
  // =========================================================
   
  getLeaderboard: () => wrap<any>(leaderboardRepository.getLeaderboard()),

  // =========================================================
  // Shop
  // =========================================================
   
  getShopItems: () => wrap<any>(shopRepository.getItems()),
   
  getInventory: () => wrap<any>(shopRepository.getInventory()),
  buyItem: (itemId: string) => wrap(shopRepository.purchaseItem(itemId)),
  equipItem: (inventoryItemId: string) => wrap(shopRepository.equipItem(inventoryItemId)),
   
  createShopItem: (data: Record<string, unknown>) => rawPost<any>('/shop/items', data),

  // =========================================================
  // Friends & Social
  // =========================================================
  inviteFriend: (friendId: string) => rawPost<any>('/api/v1/friends/invite', { friendId }),
   
  getFriends: () => wrap<any>(friendRepository.getFriends()),
   
  getPendingRequests: () => wrap<any>(friendRepository.getFriendRequests()),
  sendFriendRequest: (username: string) => wrap(friendRepository.sendFriendRequest(username)),
  acceptFriendRequest: (userId: string) => wrap(friendRepository.respondFriendRequest(userId, 'accept')),
  declineFriendRequest: (userId: string) => wrap(friendRepository.respondFriendRequest(userId, 'reject')),
  removeFriend: (friendId: string) => rawDelete(`/friends/${friendId}`),

  // =========================================================
  // Contests
  // =========================================================
   
  getContests: () => wrap<any>(contestRepository.getContests()),
   
  getContestDetail: (id: string) => wrap<any>(contestRepository.getContest(id)),
  createContest: (data: Record<string, unknown>) =>
     
    wrap<any>(contestRepository.createContest(data as never)),
  updateContest: (id: string, data: Record<string, unknown>) =>
     
    wrap<any>(contestRepository.updateContest(id, data as never)),
  deleteContest: (id: string) => wrap(contestRepository.deleteContest(id)),
  registerContest: (id: string) => wrap(contestRepository.register(id)),
  unregisterContest: (id: string) => wrap(contestRepository.unregister(id)),
   
  getContestLeaderboard: (id: string) => wrap<any>(contestRepository.getScoreboard(id)),
   
  endContest: (id: string) => wrap<any>(contestRepository.endContest(id)),
   
  getContestProblems: (id: string) => wrap<any>(contestRepository.getContestProblems(id)),
   
  getContestSubmissions: (id: string) => wrap<any>(contestRepository.getContestSubmissions(id)),

  // =========================================================
  // Rooms
  // =========================================================
   
  getActiveRooms: () => wrap<any>(roomRepository.getActiveRooms()),
   
  getCurrentRoom: () => wrap<any>(roomRepository.getCurrentRoom()),
  createRoom: (data: Record<string, unknown>) =>
     
    wrap<any>(roomRepository.createRoom(data as never)),
  kickPlayer: (roomId: string, opponentId: string) => rawPost<any>(`/rooms/kick`, { roomId, opponentId }),
  startMatch: (roomId: string) => rawPost<any>(`/rooms/start`, { roomId }),
   
  joinRoom: (data: { room_code: string }) => wrap<any>(roomRepository.joinRoom({ roomCode: data.room_code } as any)),
  leaveRoom: (roomCode: string) => wrap(roomRepository.leaveRoom(roomCode)),
  deleteRoom: (roomCode: string) => wrap(roomRepository.deleteRoom(roomCode)),

  // =========================================================
  // Comments
  // =========================================================
  getComments: (targetId: string, targetType: string) =>
     
    wrap<any>(commentRepository.getComments(targetId, targetType as never)),
  createComment: (data: Record<string, unknown>) =>
     
    wrap<any>(commentRepository.createComment(data as never)),
  updateComment: (id: string, data: Record<string, unknown>) =>
     
    wrap<any>(commentRepository.updateComment(id, data as never)),
  toggleLikeComment: (id: string) => wrap(commentRepository.likeComment(id)),
  deleteComment: (id: string) => wrap(commentRepository.deleteComment(id)),

  // =========================================================
  // Reports
  // =========================================================
  submitReport: (data: Record<string, unknown>) =>
     
    wrap<any>(reportRepository.createReport(data as never)),
   
  getReports: () => wrap<any>(reportRepository.getReports()),
  updateReportStatus: (id: string, status: 'PENDING' | 'RESOLVED' | 'REJECTED') =>
    wrap(reportRepository.updateReportStatus(id, status)),

  // =========================================================
  // AI
  // =========================================================
   
  getAIRoadmap: (data: any) => wrap<any>(aiRepository.getRoadmap(data)),
   
  getAIFeedback: (submissionId: string) => wrap<any>(aiRepository.getFeedback(submissionId)),
   
  getAIDebug: (submissionId: string) => wrap<any>(aiRepository.getDebug(submissionId)),
   
  sendAIChatMessage: (historyId: string, message: string) => wrap<any>(aiRepository.sendChatMessage(historyId, message)),
   
  getAIHistory: () => wrap<any[]>(aiRepository.getHistory()),

  // =========================================================
  // Notifications
  // =========================================================
   
  getNotifications: () => wrap<any>(notificationRepository.getNotifications()),
   
  createNotification: (data: Record<string, unknown>) => rawPost<any>('/notifications', data),
  deleteNotification: (id: string) => wrap(notificationRepository.deleteNotification(id)),
  markNotificationsAsRead: () => wrap(notificationRepository.markAllRead()),

  // =========================================================
  // Match
  // =========================================================
   
  getMatchHistory: () => wrap<any>(matchRepository.getMatches()),
   
  getActiveMatch: () => rawGet<any>('/matches/active'),
   
  getMatchDetails: (id: string) => wrap<any>(matchRepository.getMatch(id)),
  deleteMatch: (id: string) => rawDelete(`/matches/${id}`),
  // =========================================================
  // News
  // =========================================================
  getNews: (page = 1, limit = 10) => rawGet<any>(`/news?page=${page}&limit=${limit}`),
  createNews: (data: Record<string, unknown>) => rawPost<any>('/news', data),
  deleteNews: (id: string) => rawDelete(`/news/${id}`),
};

export default api;
