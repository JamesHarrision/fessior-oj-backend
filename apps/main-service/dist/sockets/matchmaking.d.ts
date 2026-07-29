export interface QueuePlayer {
    userId: string;
    socketId: string;
    username: string;
    elo: number;
}
export declare const matchmakingQueue: QueuePlayer[];
export declare const removeUserFromQueue: (userId: string) => void;
export declare const tryMatchmaking: () => Promise<void>;
export declare const startMatch: (p1: QueuePlayer, p2: QueuePlayer) => Promise<void>;
export declare const handleSubmissionUpdate: (data: {
    submissionId: string;
    userId: string;
    problemId: string;
    status: string;
    testCasesPassed: number;
    testCasesTotal: number;
    matchId?: string;
}) => Promise<void>;
export declare const endMatch: (matchId: string, winnerId: string) => Promise<void>;
export declare const handleForfeit: (matchId: string, forfeitingUserId: string) => Promise<void>;
