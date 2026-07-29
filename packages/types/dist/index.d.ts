export declare const Role: {
    readonly USER: "USER";
    readonly ADMIN: "ADMIN";
};
export type Role = typeof Role[keyof typeof Role];
export declare const SubmissionStatus: {
    readonly PENDING: "PENDING";
    readonly PROCESSING: "PROCESSING";
    readonly ACCEPTED: "ACCEPTED";
    readonly WA: "WA";
    readonly TLE: "TLE";
    readonly MLE: "MLE";
    readonly RE: "RE";
    readonly CE: "CE";
};
export type SubmissionStatus = typeof SubmissionStatus[keyof typeof SubmissionStatus];
export declare const LanguageSlug: {
    readonly CPP17: "cpp17";
    readonly JAVA21: "java21";
    readonly PYTHON3: "python3";
};
export type LanguageSlug = typeof LanguageSlug[keyof typeof LanguageSlug];
export declare const ProblemDifficulty: {
    readonly EASY: "EASY";
    readonly MEDIUM: "MEDIUM";
    readonly HARD: "HARD";
};
export type ProblemDifficulty = typeof ProblemDifficulty[keyof typeof ProblemDifficulty];
export declare const ReportType: {
    readonly BUG: "BUG";
    readonly SUGGESTION: "SUGGESTION";
    readonly OTHER: "OTHER";
};
export type ReportType = typeof ReportType[keyof typeof ReportType];
export declare const ReportStatus: {
    readonly PENDING: "PENDING";
    readonly RESOLVED: "RESOLVED";
    readonly REJECTED: "REJECTED";
};
export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];
export declare const FriendshipStatus: {
    readonly PENDING: "PENDING";
    readonly ACCEPTED: "ACCEPTED";
    readonly BLOCKED: "BLOCKED";
};
export type FriendshipStatus = typeof FriendshipStatus[keyof typeof FriendshipStatus];
export declare const MatchStatus: {
    readonly PENDING: "PENDING";
    readonly PLAYING: "PLAYING";
    readonly FINISHED: "FINISHED";
};
export type MatchStatus = typeof MatchStatus[keyof typeof MatchStatus];
export declare const RoomStatus: {
    readonly WAITING: "WAITING";
    readonly PLAYING: "PLAYING";
    readonly FINISHED: "FINISHED";
};
export type RoomStatus = typeof RoomStatus[keyof typeof RoomStatus];
export declare const NotificationType: {
    readonly FRIEND_REQUEST: "FRIEND_REQUEST";
    readonly FRIEND_ACCEPTED: "FRIEND_ACCEPTED";
    readonly MATCH_FOUND: "MATCH_FOUND";
    readonly MATCH_STARTED: "MATCH_STARTED";
    readonly MATCH_ENDED: "MATCH_ENDED";
    readonly CONTEST_STARTING: "CONTEST_STARTING";
    readonly CONTEST_ENDED: "CONTEST_ENDED";
    readonly PROBLEM_SOLVED: "PROBLEM_SOLVED";
    readonly BADGE_EARNED: "BADGE_EARNED";
    readonly ROOM_INVITE: "ROOM_INVITE";
    readonly SYSTEM: "SYSTEM";
    readonly RATING_CHANGE: "RATING_CHANGE";
    readonly NEW_COMMENT: "NEW_COMMENT";
    readonly REPORT_RESOLVED: "REPORT_RESOLVED";
};
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];
export declare const ContestStatus: {
    readonly UPCOMING: "UPCOMING";
    readonly ONGOING: "ONGOING";
    readonly ENDED: "ENDED";
};
export type ContestStatus = typeof ContestStatus[keyof typeof ContestStatus];
export declare const ShopItemCategory: {
    readonly AVATAR: "AVATAR";
    readonly BADGE: "BADGE";
    readonly THEME: "THEME";
    readonly STICKER: "STICKER";
    readonly EFFECT: "EFFECT";
    readonly OTHER: "OTHER";
};
export type ShopItemCategory = typeof ShopItemCategory[keyof typeof ShopItemCategory];
export declare const CommentTargetType: {
    readonly PROBLEM: "PROBLEM";
    readonly CONTEST: "CONTEST";
    readonly SUBMISSION: "SUBMISSION";
};
export type CommentTargetType = typeof CommentTargetType[keyof typeof CommentTargetType];
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
export type ValueOf<T> = T[keyof T];
export interface QueueJobPayload {
    submissionId: string;
    code: string;
    language: LanguageSlug;
    testcases: any[];
    timeLimit: number;
    memoryLimit: number;
}
export interface IUser {
    id: string;
    userId?: string;
    username: string;
    email?: string;
    role: Role | 'USER' | 'ADMIN';
    elo_rating?: number;
    eloRating?: number;
    streak_count?: number;
    streakCount?: number;
    max_streak?: number;
    maxStreak?: number;
    avatar?: string;
    avatar_url?: string;
    avatarUrl?: string;
}
export interface IProblem {
    id?: string;
    _id?: string;
    mongo_problem_id?: string;
    title: string;
    slug: string;
    description: string;
    difficulty: ProblemDifficulty | 'EASY' | 'MEDIUM' | 'HARD';
    timeLimit?: number;
    memoryLimit?: number;
    tags?: any[];
    starterCodes?: {
        cpp?: string;
        java?: string;
        python?: string;
        [key: string]: string | undefined;
    };
}
export interface ISubmission {
    id?: string;
    _id?: string;
    problemId: string;
    userId: string;
    code: string;
    language: LanguageSlug | 'python' | 'cpp' | 'java';
    status: SubmissionStatus | 'PENDING' | 'PROCESSING' | 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'ERROR';
    errorMessage?: string;
    testCasesPassed?: number;
    testCasesTotal?: number;
    timeLimit?: number;
    memoryLimit?: number;
    aiFeedback?: string;
    createdAt?: string | Date;
}
export interface ICustomRoomParticipant {
    id: string;
    room_id: string;
    user_id: string;
    is_ready: boolean;
    joined_at: string | Date;
    user?: IUser;
}
export interface ICustomRoom {
    id: string;
    room_code: string;
    creator_id: string;
    status: 'WAITING' | 'PLAYING' | 'FINISHED';
    difficulty?: ProblemDifficulty | 'EASY' | 'MEDIUM' | 'HARD' | null;
    time_limit?: number;
    memory_limit?: number;
    max_participants?: number;
    creator?: IUser;
    participants?: ICustomRoomParticipant[];
    match_id?: string | null;
    problem_id?: string | null;
    _count?: {
        participants: number;
    };
}
export interface IMatchParticipant {
    id: string;
    match_id: string;
    user_id: string;
    status: 'CODING' | 'SUBMITTED_WA' | 'ACCEPTED';
    score_change: number;
    is_winner: boolean;
    joined_at: string | Date;
    user?: IUser;
}
export interface IMatch {
    id: string;
    player1_id?: string | null;
    player2_id?: string | null;
    problem_id: string;
    status: 'PENDING' | 'PLAYING' | 'FINISHED';
    winner_id?: string | null;
    started_at?: string | Date;
    ended_at?: string | Date | null;
    player1?: IUser;
    player2?: IUser;
    participants?: IMatchParticipant[];
    problem?: IProblem;
}
export interface IContestRegistration {
    contest_id: string;
    user_id: string;
    registered_at: string | Date;
    user?: IUser;
}
export interface IContestProblem {
    contest_id: string;
    mongo_problem_id: string;
    points: number;
    order: number;
    problem?: IProblem;
}
export interface IContest {
    id: string;
    title: string;
    description?: string | null;
    start_time: string | Date;
    end_time: string | Date;
    status: ContestStatus | 'UPCOMING' | 'REGISTRATION' | 'ONGOING' | 'ENDED' | 'RESULTS';
    created_at?: string | Date;
    updated_at?: string | Date;
    problems?: IContestProblem[];
    registrations?: IContestRegistration[];
    _count?: {
        registrations: number;
    };
}
export interface IReport {
    id: string;
    userId: string;
    problemId?: string | null;
    type: 'BUG' | 'SUGGESTION' | 'OTHER';
    content: string;
    status: 'PENDING' | 'RESOLVED' | 'REJECTED';
    createdAt?: string | Date;
}
export interface ITag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
}
export interface IComment {
    id: string;
    targetId: string;
    targetType: CommentTargetType;
    userId: string;
    parentId?: string | null;
    content: string;
    likes: number;
    user?: IUser;
    replies?: IComment[];
    createdAt: string | Date;
}
export interface IFriendship {
    id: string;
    userId: string;
    friendId: string;
    status: FriendshipStatus;
    createdAt: string | Date;
}
export interface INotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any> | null;
    isRead: boolean;
    createdAt: string | Date;
}
export interface IShopItem {
    id: string;
    name: string;
    description?: string;
    category: ShopItemCategory;
    price: number;
    imageUrl?: string;
    isActive: boolean;
}
export interface IInventoryItem {
    id: string;
    userId: string;
    shopItemId: string;
    quantity: number;
    isEquipped: boolean;
    shopItem?: IShopItem;
}
export interface IUserBadge {
    id: string;
    userId: string;
    badgeId: string;
    earnedAt: string | Date;
    badge?: IBadge;
}
export interface IBadge {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    category: string;
}
export interface IEloHistory {
    id: string;
    userId: string;
    elo: number;
    change: number;
    reason?: string;
    matchId?: string | null;
    createdAt: string | Date;
}
export interface IUserActivity {
    id: string;
    userId: string;
    date: string;
    submissionCount: number;
    solvedCount: number;
    streakCount: number;
}
export interface IUserTagStats {
    id: string;
    userId: string;
    tagId: string;
    solvedCount: number;
}
export interface ILeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    eloRating: number;
    solvedCount: number;
    streakCount: number;
    avatarUrl?: string;
}
export interface IContestScoreboardEntry {
    rank: number;
    userId: string;
    username: string;
    solved: number;
    totalTime: number;
    score: number;
}
export interface ISession {
    id: string;
    userId: string;
    ip: string;
    userAgent: string;
    createdAt: string | Date;
    expiresAt: string | Date;
    isRevoked: boolean;
}
export interface ApiResponse<T = unknown> {
    status: number;
    message: string;
    data: T;
}
export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}
export interface RefreshRequest {
    refreshToken: string;
}
export interface ForgotPasswordRequest {
    email: string;
}
export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
export interface ProblemListQuery {
    search?: string;
    difficulty?: ProblemDifficulty;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'title' | 'difficulty' | 'createdAt' | 'solvedCount';
    sortOrder?: 'asc' | 'desc';
}
export interface CreateProblemRequest {
    title: string;
    slug: string;
    description: string;
    difficulty: ProblemDifficulty;
    timeLimit?: number;
    memoryLimit?: number;
    tags?: string[];
    starterCodes?: {
        cpp?: string;
        java?: string;
        python?: string;
    };
    testcases?: Array<{
        input: string;
        expectedOutput: string;
        isHidden?: boolean;
    }>;
}
export interface UpdateProblemRequest {
    title?: string;
    slug?: string;
    description?: string;
    difficulty?: ProblemDifficulty;
    timeLimit?: number;
    memoryLimit?: number;
    tags?: string[];
    starterCodes?: {
        cpp?: string;
        java?: string;
        python?: string;
    };
}
export interface SubmissionListQuery {
    userId?: string;
    problemId?: string;
    status?: SubmissionStatus;
    language?: LanguageSlug;
    page?: number;
    limit?: number;
    contestId?: string;
}
export interface SubmitCodeRequest {
    problemId: string;
    code: string;
    language: LanguageSlug;
    matchId?: string;
    contestId?: string;
}
export interface RunCodeRequest {
    problemId: string;
    code: string;
    language: LanguageSlug;
    input?: string;
}
export interface CreateContestRequest {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    problems?: string[];
}
export interface UpdateContestRequest {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    problems?: string[];
}
export interface ContestRegistrationRequest {
    contestId: string;
}
export interface CreateRoomRequest {
    difficulty?: ProblemDifficulty;
    timeLimit?: number;
    memoryLimit?: number;
    maxParticipants?: number;
}
export interface JoinRoomRequest {
    roomCode: string;
}
export interface CreateCommentRequest {
    targetId: string;
    targetType: CommentTargetType;
    content: string;
    parentId?: string;
}
export interface UpdateCommentRequest {
    content: string;
}
export interface FriendRequestAction {
    action: 'accept' | 'reject' | 'block';
}
export interface CreateReportRequest {
    type: ReportType;
    content: string;
    problemId?: string;
}
export interface ShopPurchaseRequest {
    shopItemId: string;
}
export interface NotificationQuery {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}
export interface UserUpdateProfileRequest {
    username?: string;
    avatarUrl?: string;
}
export interface LeaderboardQuery {
    page?: number;
    limit?: number;
    sortBy?: 'eloRating' | 'solvedCount' | 'streakCount';
}
export interface SocketQueueStatus {
    queueSize: number;
    estimatedWait: number;
}
export interface SocketMatchFound {
    match: IMatch;
    opponent: IUser;
    problem: IProblem;
}
export interface SocketRivalSubmission {
    userId: string;
    status: SubmissionStatus;
    testCasesPassed: number;
    testCasesTotal: number;
}
export interface SocketMatchEnded {
    match: IMatch;
    winner: IUser;
    ratingChange: number;
}
export interface SocketNotification {
    notification: INotification;
}
