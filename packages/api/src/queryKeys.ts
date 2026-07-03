export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
    sessions: ['auth', 'sessions'] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    profile: (username: string) => ['users', 'profile', username] as const,
    stats: (id: string) => ['users', 'stats', id] as const,
  },
  problems: {
    all: ['problems'] as const,
    list: (filters?: Record<string, unknown>) => ['problems', 'list', filters ?? {}] as const,
    detail: (slug: string) => ['problems', 'detail', slug] as const,
    detailById: (id: string) => ['problems', 'detailById', id] as const,
    tags: ['problems', 'tags'] as const,
    testcases: (problemId: string) => ['problems', 'testcases', problemId] as const,
  },
  submissions: {
    all: ['submissions'] as const,
    list: (filters?: Record<string, unknown>) => ['submissions', 'list', filters ?? {}] as const,
    detail: (id: string) => ['submissions', 'detail', id] as const,
    history: (userId: string) => ['submissions', 'history', userId] as const,
  },
  leaderboard: {
    all: ['leaderboard'] as const,
    list: (filters?: Record<string, unknown>) => ['leaderboard', 'list', filters ?? {}] as const,
  },
  rooms: {
    all: ['rooms'] as const,
    active: ['rooms', 'active'] as const,
    detail: (roomCode: string) => ['rooms', 'detail', roomCode] as const,
  },
  matches: {
    all: ['matches'] as const,
    list: (filters?: Record<string, unknown>) => ['matches', 'list', filters ?? {}] as const,
    detail: (id: string) => ['matches', 'detail', id] as const,
  },
  contests: {
    all: ['contests'] as const,
    list: (filters?: Record<string, unknown>) => ['contests', 'list', filters ?? {}] as const,
    detail: (id: string) => ['contests', 'detail', id] as const,
    scoreboard: (id: string) => ['contests', 'scoreboard', id] as const,
    registration: (id: string) => ['contests', 'registration', id] as const,
  },
  comments: {
    all: ['comments'] as const,
    byTarget: (targetId: string, targetType: string) => ['comments', targetType, targetId] as const,
  },
  friends: {
    all: ['friends'] as const,
    list: ['friends', 'list'] as const,
    requests: ['friends', 'requests'] as const,
  },
  shop: {
    all: ['shop'] as const,
    items: ['shop', 'items'] as const,
    inventory: ['shop', 'inventory'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: Record<string, unknown>) => ['notifications', 'list', filters ?? {}] as const,
    unreadCount: ['notifications', 'unreadCount'] as const,
  },
  reports: {
    all: ['reports'] as const,
    list: (filters?: Record<string, unknown>) => ['reports', 'list', filters ?? {}] as const,
    myReports: ['reports', 'myReports'] as const,
  },
  ai: {
    roadmap: ['ai', 'roadmap'] as const,
    feedback: (submissionId: string) => ['ai', 'feedback', submissionId] as const,
  },
} as const;
