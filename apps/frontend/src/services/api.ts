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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
async function rawPut<T>(path: string, body?: unknown) {
  return wrap<T>(httpClient.request('PUT', path, { body }));
}
async function rawDelete(path: string) {
  return wrap<void>(httpClient.request('DELETE', path));
}

// ── API object ──
export const api = {
  // =========================================================
  // Auth & User
  // =========================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMe: () => wrap<any>(userRepository.getProfile('me')),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCurrentUser: () => wrap<any>(userRepository.getProfile('me')),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSessions: () => rawGet<any>('/auth/sessions'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    rawPost<{ message: string }>('/auth/change-password', data),
  revokeSession: (sessionId: string) => rawDelete(`/auth/sessions/${sessionId}`),
  revokeAllSessions: () => rawDelete('/auth/sessions'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile: (data: Record<string, unknown>) => wrap<any>(userRepository.updateProfile(data)),

  // =========================================================
  // Problems
  // =========================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProblems: () => wrap<any>(problemRepository.getProblems()),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProblemDetail: (slug: string) => wrap<any>(problemRepository.getProblem(slug)),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProblemTags: () => wrap<any>(problemRepository.getTags()),
  createProblem: (data: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(problemRepository.createProblem(data as never)),
  updateProblem: (id: string, data: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(problemRepository.updateProblem(id, data as never)),
  deleteProblem: (id: string) => wrap(problemRepository.deleteProblem(id)),

  // Tag management (admin)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createTag: (data: Record<string, unknown>) => rawPost<any>('/problems/tags', data),

  // Testcase management
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTestcases: (problemId: string) => wrap<any>(problemRepository.getTestcases(problemId)),
  addTestcase: (problemId: string, data: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(problemRepository.createTestcase(problemId, data)),
  deleteTestcase: (problemId: string, testcaseId: string) =>
    wrap(problemRepository.deleteTestcase(problemId, testcaseId)),

  // =========================================================
  // Submissions
  // =========================================================
  submitCode: (data: { problemId: string; code: string; language: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(submissionRepository.submit(data)),
  runCode: (data: { problemId?: string; code: string; language: string; testCases?: unknown[] }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(submissionRepository.run(data)),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSubmissionDetail: (id: string) => wrap<any>(submissionRepository.getSubmission(id)),
  getSubmissions: (params?: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(submissionRepository.getSubmissions(params as never)),

  // =========================================================
  // Leaderboard
  // =========================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getLeaderboard: () => wrap<any>(leaderboardRepository.getLeaderboard()),

  // =========================================================
  // Shop
  // =========================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getShopItems: () => wrap<any>(shopRepository.getItems()),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getInventory: () => wrap<any>(shopRepository.getInventory()),
  buyItem: (itemId: string) => wrap(shopRepository.purchaseItem(itemId)),
  equipItem: (inventoryItemId: string) => wrap(shopRepository.equipItem(inventoryItemId)),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createShopItem: (data: Record<string, unknown>) => rawPost<any>('/shop/items', data),

  // =========================================================
  // Friends & Social
  // =========================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFriends: () => wrap<any>(friendRepository.getFriends()),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPendingRequests: () => wrap<any>(friendRepository.getFriendRequests()),
  sendFriendRequest: (username: string) => wrap(friendRepository.sendFriendRequest(username)),
  acceptFriendRequest: (userId: string) => wrap(friendRepository.respondFriendRequest(userId, 'accept')),
  declineFriendRequest: (userId: string) => wrap(friendRepository.respondFriendRequest(userId, 'reject')),
  removeFriend: (friendId: string) => rawDelete(`/friends/${friendId}`),

  // =========================================================
  // Contests
  // =========================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getContests: () => wrap<any>(contestRepository.getContests()),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getContestDetail: (id: string) => wrap<any>(contestRepository.getContest(id)),
  createContest: (data: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(contestRepository.createContest(data as never)),
  updateContest: (id: string, data: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(contestRepository.updateContest(id, data as never)),
  deleteContest: (id: string) => wrap(contestRepository.deleteContest(id)),
  registerContest: (id: string) => wrap(contestRepository.register(id)),
  unregisterContest: (id: string) => wrap(contestRepository.unregister(id)),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getContestLeaderboard: (id: string) => wrap<any>(contestRepository.getScoreboard(id)),

  // =========================================================
  // Rooms
  // =========================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getActiveRooms: () => wrap<any>(roomRepository.getActiveRooms()),
  createRoom: (data: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(roomRepository.createRoom(data as never)),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  joinRoom: (data: { room_code: string }) => wrap<any>(roomRepository.joinRoom(data)),
  leaveRoom: (roomCode: string) => wrap(roomRepository.leaveRoom(roomCode)),
  deleteRoom: (roomCode: string) => wrap(roomRepository.deleteRoom(roomCode)),

  // =========================================================
  // Comments
  // =========================================================
  getComments: (targetId: string, targetType: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(commentRepository.getComments(targetId, targetType as never)),
  createComment: (data: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(commentRepository.createComment(data as never)),
  updateComment: (id: string, data: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(commentRepository.updateComment(id, data as never)),
  toggleLikeComment: (id: string) => wrap(commentRepository.likeComment(id)),
  deleteComment: (id: string) => wrap(commentRepository.deleteComment(id)),

  // =========================================================
  // Reports
  // =========================================================
  submitReport: (data: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrap<any>(reportRepository.createReport(data as never)),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getReports: () => wrap<any>(reportRepository.getReports()),
  updateReportStatus: (id: string, status: 'PENDING' | 'RESOLVED' | 'REJECTED') =>
    wrap(reportRepository.updateReportStatus(id, status)),

  // =========================================================
  // AI
  // =========================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAIRoadmap: () => wrap<any>(aiRepository.getRoadmap()),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAIFeedback: (submissionId: string) => wrap<any>(aiRepository.getFeedback(submissionId)),

  // =========================================================
  // Notifications
  // =========================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getNotifications: () => wrap<any>(notificationRepository.getNotifications()),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createNotification: (data: Record<string, unknown>) => rawPost<any>('/notifications', data),
  deleteNotification: (id: string) => wrap(notificationRepository.deleteNotification(id)),
  markNotificationsAsRead: () => wrap(notificationRepository.markAllRead()),

  // =========================================================
  // Match
  // =========================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMatchHistory: () => wrap<any>(matchRepository.getMatches()),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMatchDetails: (id: string) => wrap<any>(matchRepository.getMatch(id)),
  deleteMatch: (id: string) => rawDelete(`/matches/${id}`),
};

export default api;
