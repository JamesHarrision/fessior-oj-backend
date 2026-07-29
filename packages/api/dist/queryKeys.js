export const queryKeys = {
    auth: {
        me: ['auth', 'me'],
        sessions: ['auth', 'sessions'],
    },
    users: {
        all: ['users'],
        detail: (id) => ['users', id],
        profile: (username) => ['users', 'profile', username],
        stats: (id) => ['users', 'stats', id],
    },
    problems: {
        all: ['problems'],
        list: (filters) => ['problems', 'list', filters ?? {}],
        detail: (slug) => ['problems', 'detail', slug],
        detailById: (id) => ['problems', 'detailById', id],
        tags: ['problems', 'tags'],
        testcases: (problemId) => ['problems', 'testcases', problemId],
    },
    submissions: {
        all: ['submissions'],
        list: (filters) => ['submissions', 'list', filters ?? {}],
        detail: (id) => ['submissions', 'detail', id],
        history: (userId) => ['submissions', 'history', userId],
    },
    leaderboard: {
        all: ['leaderboard'],
        list: (filters) => ['leaderboard', 'list', filters ?? {}],
    },
    rooms: {
        all: ['rooms'],
        active: ['rooms', 'active'],
        detail: (roomCode) => ['rooms', 'detail', roomCode],
    },
    matches: {
        all: ['matches'],
        list: (filters) => ['matches', 'list', filters ?? {}],
        detail: (id) => ['matches', 'detail', id],
    },
    contests: {
        all: ['contests'],
        list: (filters) => ['contests', 'list', filters ?? {}],
        detail: (id) => ['contests', 'detail', id],
        scoreboard: (id) => ['contests', 'scoreboard', id],
        registration: (id) => ['contests', 'registration', id],
    },
    comments: {
        all: ['comments'],
        byTarget: (targetId, targetType) => ['comments', targetType, targetId],
    },
    friends: {
        all: ['friends'],
        list: ['friends', 'list'],
        requests: ['friends', 'requests'],
    },
    shop: {
        all: ['shop'],
        items: ['shop', 'items'],
        inventory: ['shop', 'inventory'],
    },
    notifications: {
        all: ['notifications'],
        list: (filters) => ['notifications', 'list', filters ?? {}],
        unreadCount: ['notifications', 'unreadCount'],
    },
    reports: {
        all: ['reports'],
        list: (filters) => ['reports', 'list', filters ?? {}],
        myReports: ['reports', 'myReports'],
    },
    ai: {
        roadmap: ['ai', 'roadmap'],
        feedback: (submissionId) => ['ai', 'feedback', submissionId],
    },
};
