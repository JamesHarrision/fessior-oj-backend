export declare const queryKeys: {
    readonly auth: {
        readonly me: readonly ["auth", "me"];
        readonly sessions: readonly ["auth", "sessions"];
    };
    readonly users: {
        readonly all: readonly ["users"];
        readonly detail: (id: string) => readonly ["users", string];
        readonly profile: (username: string) => readonly ["users", "profile", string];
        readonly stats: (id: string) => readonly ["users", "stats", string];
    };
    readonly problems: {
        readonly all: readonly ["problems"];
        readonly list: (filters?: Record<string, unknown>) => readonly ["problems", "list", Record<string, unknown>];
        readonly detail: (slug: string) => readonly ["problems", "detail", string];
        readonly detailById: (id: string) => readonly ["problems", "detailById", string];
        readonly tags: readonly ["problems", "tags"];
        readonly testcases: (problemId: string) => readonly ["problems", "testcases", string];
    };
    readonly submissions: {
        readonly all: readonly ["submissions"];
        readonly list: (filters?: Record<string, unknown>) => readonly ["submissions", "list", Record<string, unknown>];
        readonly detail: (id: string) => readonly ["submissions", "detail", string];
        readonly history: (userId: string) => readonly ["submissions", "history", string];
    };
    readonly leaderboard: {
        readonly all: readonly ["leaderboard"];
        readonly list: (filters?: Record<string, unknown>) => readonly ["leaderboard", "list", Record<string, unknown>];
    };
    readonly rooms: {
        readonly all: readonly ["rooms"];
        readonly active: readonly ["rooms", "active"];
        readonly detail: (roomCode: string) => readonly ["rooms", "detail", string];
    };
    readonly matches: {
        readonly all: readonly ["matches"];
        readonly list: (filters?: Record<string, unknown>) => readonly ["matches", "list", Record<string, unknown>];
        readonly detail: (id: string) => readonly ["matches", "detail", string];
    };
    readonly contests: {
        readonly all: readonly ["contests"];
        readonly list: (filters?: Record<string, unknown>) => readonly ["contests", "list", Record<string, unknown>];
        readonly detail: (id: string) => readonly ["contests", "detail", string];
        readonly scoreboard: (id: string) => readonly ["contests", "scoreboard", string];
        readonly registration: (id: string) => readonly ["contests", "registration", string];
    };
    readonly comments: {
        readonly all: readonly ["comments"];
        readonly byTarget: (targetId: string, targetType: string) => readonly ["comments", string, string];
    };
    readonly friends: {
        readonly all: readonly ["friends"];
        readonly list: readonly ["friends", "list"];
        readonly requests: readonly ["friends", "requests"];
    };
    readonly shop: {
        readonly all: readonly ["shop"];
        readonly items: readonly ["shop", "items"];
        readonly inventory: readonly ["shop", "inventory"];
    };
    readonly notifications: {
        readonly all: readonly ["notifications"];
        readonly list: (filters?: Record<string, unknown>) => readonly ["notifications", "list", Record<string, unknown>];
        readonly unreadCount: readonly ["notifications", "unreadCount"];
    };
    readonly reports: {
        readonly all: readonly ["reports"];
        readonly list: (filters?: Record<string, unknown>) => readonly ["reports", "list", Record<string, unknown>];
        readonly myReports: readonly ["reports", "myReports"];
    };
    readonly ai: {
        readonly roadmap: readonly ["ai", "roadmap"];
        readonly feedback: (submissionId: string) => readonly ["ai", "feedback", string];
    };
};
