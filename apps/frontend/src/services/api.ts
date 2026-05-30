const BASE_URL = 'http://localhost:6868/api/v1';

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
  return data;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: (body: any = {}) => request<any>('/auth/logout', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),

  // Problems
  getProblems: (params?: { difficulty?: string; tag?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/problems?${query}`);
  },
  getProblemDetail: (slug: string) => request<any>(`/problems/${slug}`),

  // Submissions
  submitCode: (body: { problemId: string; language: string; code: string }) =>
    request<any>('/submissions', { method: 'POST', body: JSON.stringify(body) }),
  getSubmissions: () => request<any>('/submissions'),
  getSubmissionDetail: (id: string) => request<any>(`/submissions/${id}`),

  // Rooms
  getActiveRooms: () => request<any>('/rooms/active'),
  createRoom: (body: { problemId?: string; difficulty?: string }) =>
    request<any>('/rooms/create', { method: 'POST', body: JSON.stringify(body) }),
  joinRoom: (body: { roomCode: string }) =>
    request<any>('/rooms/join', { method: 'POST', body: JSON.stringify(body) }),
  leaveRoom: () => request<any>('/rooms/leave', { method: 'POST' }),

  // Friends & Presence
  getFriends: () => request<any>('/friends'),
  sendFriendRequest: (receiverId: string) =>
    request<any>('/friends/request', { method: 'POST', body: JSON.stringify({ receiverId }) }),
  respondFriendRequest: (senderId: string, action: 'ACCEPT' | 'DECLINE') =>
    request<any>('/friends/respond', { method: 'POST', body: JSON.stringify({ senderId, action }) }),

  // Leaderboard
  getLeaderboard: () => request<any>('/leaderboard'),

  // Shop & Inventory
  getShopItems: () => request<any>('/shop/items'),
  buyItem: (itemId: string) => request<any>('/shop/buy', { method: 'POST', body: JSON.stringify({ itemId }) }),
  getInventory: () => request<any>('/shop/inventory'),
  equipItem: (inventoryItemId: string) =>
    request<any>('/shop/inventory/equip', { method: 'POST', body: JSON.stringify({ inventoryItemId }) }),

  // Reports
  submitReport: (body: { type: string; content: string; problemId?: string }) =>
    request<any>('/reports', { method: 'POST', body: JSON.stringify(body) }),

  // Contests
  getContests: () => request<any>('/contests'),
  registerContest: (contestId: string) => request<any>(`/contests/${contestId}/register`, { method: 'POST' }),
  getContestLeaderboard: (contestId: string) => request<any>(`/contests/${contestId}/leaderboard`),
};
