import { API_ROUTES } from '@ocj/constants';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6868/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return {
    ...data,
    success: data.status === 'Success',
  };
}

export const api = {
  // Auth
  register: (body: any) => request<any>(`${API_ROUTES.AUTH}/register`, { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>(`${API_ROUTES.AUTH}/login`, { method: 'POST', body: JSON.stringify(body) }),
  logout: (body: any = {}) => request<any>(`${API_ROUTES.AUTH}/logout`, { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>(`${API_ROUTES.AUTH}/me`),
  changePassword: (body: any) => request<any>(`${API_ROUTES.AUTH}/change-password`, { method: 'POST', body: JSON.stringify(body) }),
  getSessions: () => request<any>(`${API_ROUTES.AUTH}/sessions`),
  revokeSession: (sessionId: string) => request<any>(`${API_ROUTES.AUTH}/sessions/${sessionId}`, { method: 'DELETE' }),
  revokeAllSessions: () => request<any>(`${API_ROUTES.AUTH}/sessions`, { method: 'DELETE' }),
  forgotPassword: (body: any) => request<any>(`${API_ROUTES.AUTH}/forgot-password`, { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body: any) => request<any>(`${API_ROUTES.AUTH}/reset-password`, { method: 'POST', body: JSON.stringify(body) }),

  // Problems
  getProblems: (params?: { difficulty?: string; tag?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`${API_ROUTES.PROBLEMS}?${query}`);
  },
  getProblemDetail: (slug: string) => request<any>(`${API_ROUTES.PROBLEMS}/${slug}`),
  getProblemTags: () => request<any>(`${API_ROUTES.PROBLEMS}/tags`),
  createProblem: (body: any) => request<any>(`${API_ROUTES.PROBLEMS}`, { method: 'POST', body: JSON.stringify(body) }),
  updateProblem: (id: string, body: any) => request<any>(`${API_ROUTES.PROBLEMS}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProblem: (id: string) => request<any>(`${API_ROUTES.PROBLEMS}/${id}`, { method: 'DELETE' }),
  getTestcases: (problemId: string, exampleOnly = false) =>
    request<any>(`${API_ROUTES.PROBLEMS}/${problemId}/testcases${exampleOnly ? '?example=true' : ''}`),
  addTestcase: (problemId: string, body: any) =>
    request<any>(`${API_ROUTES.PROBLEMS}/${problemId}/testcases`, { method: 'POST', body: JSON.stringify(body) }),
  deleteTestcase: (testcaseId: string) =>
    request<any>(`${API_ROUTES.PROBLEMS}/testcases/${testcaseId}`, { method: 'DELETE' }),
  createTag: (body: any) =>
    request<any>(`${API_ROUTES.PROBLEMS}/tags`, { method: 'POST', body: JSON.stringify(body) }),

  // Submissions
  submitCode: (body: { problemId: string; language: string; code: string }) =>
    request<any>(`${API_ROUTES.SUBMISSIONS}`, { method: 'POST', body: JSON.stringify(body) }),
  runCode: (body: { problemId: string; language: string; code: string; customInput?: string }) =>
    request<any>(`${API_ROUTES.SUBMISSIONS}/run`, { method: 'POST', body: JSON.stringify(body) }),
  getSubmissions: () => request<any>(`${API_ROUTES.SUBMISSIONS}`),
  getSubmissionDetail: (id: string) => request<any>(`${API_ROUTES.SUBMISSIONS}/${id}`),

  // Rooms
  getActiveRooms: () => request<any>(`${API_ROUTES.ROOMS}/active`),
  createRoom: (body: { problemId?: string; difficulty?: string }) =>
    request<any>(`${API_ROUTES.ROOMS}/create`, { method: 'POST', body: JSON.stringify(body) }),
  joinRoom: (body: { roomCode: string }) =>
    request<any>(`${API_ROUTES.ROOMS}/join`, { method: 'POST', body: JSON.stringify(body) }),
  leaveRoom: (body: { roomId: string }) =>
    request<any>(`${API_ROUTES.ROOMS}/leave`, { method: 'POST', body: JSON.stringify(body) }),
  deleteRoom: (roomId: string) => request<any>(`${API_ROUTES.ROOMS}/${roomId}`, { method: 'DELETE' }),

  // Friends & Presence
  getFriends: () => request<any>(`${API_ROUTES.FRIENDS}`),
  getPendingRequests: () => request<any>(`${API_ROUTES.FRIENDS}/requests`),
  sendFriendRequest: (receiverId: string) =>
    request<any>(`${API_ROUTES.FRIENDS}/request`, { method: 'POST', body: JSON.stringify({ receiverId }) }),
  acceptFriendRequest: (senderId: string) =>
    request<any>(`${API_ROUTES.FRIENDS}/accept`, { method: 'POST', body: JSON.stringify({ senderId }) }),
  declineFriendRequest: (senderId: string) =>
    request<any>(`${API_ROUTES.FRIENDS}/decline`, { method: 'POST', body: JSON.stringify({ senderId }) }),
  removeFriend: (friendId: string) =>
    request<any>(`${API_ROUTES.FRIENDS}/${friendId}`, { method: 'DELETE' }),

  // Leaderboard
  getLeaderboard: () => request<any>(`${API_ROUTES.LEADERBOARD}`),

  // Shop & Inventory
  getShopItems: () => request<any>(`${API_ROUTES.SHOP}`),
  createShopItem: (body: any) => request<any>(`${API_ROUTES.SHOP}`, { method: 'POST', body: JSON.stringify(body) }),
  buyItem: (itemId: string) => request<any>(`${API_ROUTES.SHOP}/buy`, { method: 'POST', body: JSON.stringify({ itemId }) }),
  getInventory: () => request<any>(`${API_ROUTES.SHOP}/inventory`),
  equipItem: (inventoryItemId: string) =>
    request<any>(`${API_ROUTES.SHOP}/equip`, { method: 'POST', body: JSON.stringify({ inventoryItemId }) }),

  // Reports
  submitReport: (body: { type: string; content: string; problemId?: string }) =>
    request<any>(`${API_ROUTES.REPORTS}`, { method: 'POST', body: JSON.stringify(body) }),
  getReports: () => request<any>(`${API_ROUTES.REPORTS}`),
  updateReportStatus: (reportId: string, body: { status: string }) =>
    request<any>(`${API_ROUTES.REPORTS}/${reportId}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Contests
  getContests: () => request<any>(`${API_ROUTES.CONTESTS}`),
  createContest: (body: any) => request<any>(`${API_ROUTES.CONTESTS}`, { method: 'POST', body: JSON.stringify(body) }),
  updateContest: (contestId: string, body: any) => request<any>(`${API_ROUTES.CONTESTS}/${contestId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteContest: (contestId: string) => request<any>(`${API_ROUTES.CONTESTS}/${contestId}`, { method: 'DELETE' }),
  registerContest: (contestId: string) => request<any>(`${API_ROUTES.CONTESTS}/${contestId}/register`, { method: 'POST' }),
  unregisterContest: (contestId: string) => request<any>(`${API_ROUTES.CONTESTS}/${contestId}/unregister`, { method: 'POST' }),
  getContestLeaderboard: (contestId: string) => request<any>(`${API_ROUTES.CONTESTS}/${contestId}/leaderboard`),
  getContestProblems: (contestId: string) => request<any>(`${API_ROUTES.CONTESTS}/${contestId}/problems`),
  getContestSubmissions: (contestId: string) => request<any>(`${API_ROUTES.CONTESTS}/${contestId}/submissions`),

  // AI
  getAIRoadmap: (body: { skillLevel: string; focusArea: string }) =>
    request<any>(`${API_ROUTES.AI}/roadmap`, { method: 'POST', body: JSON.stringify(body) }),
  getAIFeedback: (submissionId: string) =>
    request<any>(`${API_ROUTES.AI}/feedback/${submissionId}`, { method: 'POST' }),

  // Comments
  getComments: (targetId: string, targetType = 'PROBLEM') => request<any>(`${API_ROUTES.COMMENTS}?targetId=${targetId}&targetType=${targetType}`),
  createComment: (body: { targetId: string; targetType: string; content: string; parentId?: string }) =>
    request<any>(`${API_ROUTES.COMMENTS}`, { method: 'POST', body: JSON.stringify(body) }),
  updateComment: (id: string, body: { content: string }) =>
    request<any>(`${API_ROUTES.COMMENTS}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteComment: (id: string) => request<any>(`${API_ROUTES.COMMENTS}/${id}`, { method: 'DELETE' }),
  toggleLikeComment: (id: string) => request<any>(`${API_ROUTES.COMMENTS}/${id}/like`, { method: 'POST' }),

  // Match History
  getMatchHistory: () => request<any>(`${API_ROUTES.MATCHES}/history`),
  getMatchDetails: (id: string) => request<any>(`${API_ROUTES.MATCHES}/${id}`),
  deleteMatch: (id: string) => request<any>(`${API_ROUTES.MATCHES}/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request<any>(`${API_ROUTES.NOTIFICATIONS}`),
  createNotification: (body: { title: string; content: string; type: string; userId?: string }) =>
    request<any>(`${API_ROUTES.NOTIFICATIONS}`, { method: 'POST', body: JSON.stringify(body) }),
  markNotificationsAsRead: (notificationIds: string[]) =>
    request<any>(`${API_ROUTES.NOTIFICATIONS}/read`, { method: 'PUT', body: JSON.stringify({ notificationIds }) }),
  deleteNotification: (id: string) => request<any>(`${API_ROUTES.NOTIFICATIONS}/${id}`, { method: 'DELETE' }),
  request: <T = any>(endpoint: string, options?: RequestInit) => request<T>(endpoint, options),
};
