// Hằng số giới hạn tài nguyên mặc định
export const DEFAULT_LIMITS = {
  TIME_LIMIT_MS: 2000,
  MEMORY_LIMIT_MB: 256,
} as const;

// Danh sách ngôn ngữ được hỗ trợ
export const SUPPORTED_LANGUAGES = ['cpp', 'java', 'python'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Các API endpoint routes chính
export const API_ROUTES = {
  AUTH: '/auth',
  USER: '/users',
  PROBLEMS: '/problems',
  SUBMISSIONS: '/submissions',
  AI: '/ai',
  LEADERBOARD: '/leaderboard',
  ROOMS: '/rooms',
  MATCHES: '/matches',
  CONTESTS: '/contests',
  COMMENTS: '/comments',
  FRIENDS: '/friends',
  SHOP: '/shop',
  NOTIFICATIONS: '/notifications',
  REPORTS: '/reports',
  ROADMAPS: '/roadmaps',
} as const;

// Các sự kiện Socket.io dùng chung giữa FE và BE
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  JOIN_QUEUE: 'join-queue',
  LEAVE_QUEUE: 'leave-queue',
  FORFEIT_MATCH: 'forfeit-match',
  JOIN_CUSTOM_ROOM: 'join-custom-room',
  LEAVE_CUSTOM_ROOM: 'leave-custom-room',
  QUEUE_STATUS: 'queue-status',
  MATCH_FOUND: 'match-found',
  RIVAL_SUBMISSION: 'rival-submission',
  MATCH_ENDED: 'match-ended',
  MATCH_STARTED: 'match-started',
  PLAYER_LEFT: 'player-left',
  CONFIG_UPDATED: 'config-updated',
  ROOM_DELETED: 'room-deleted',
  NOTIFICATION: 'notification',
  PLAYER_JOINED: 'player-joined',
  PLAYER_KICKED: 'player-kicked',
  JOIN_CONTEST: 'join-contest',
  LEAVE_CONTEST: 'leave-contest',
  CONTEST_LEADERBOARD_UPDATE: 'contest-leaderboard-update',
  ACTIVE_ROOMS_UPDATE: 'active-rooms-update',
} as const;

// Các kênh Redis Pub/Sub
export const REDIS_CHANNELS = {
  SUBMISSION_UPDATES: 'submission-updates',
} as const;
