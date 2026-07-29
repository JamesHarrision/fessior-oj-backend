// ============================================================
// Shared Enums (const objects for erasableSyntaxOnly compatibility)
// ============================================================
export const Role = {
    USER: 'USER',
    ADMIN: 'ADMIN'
};
export const SubmissionStatus = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    ACCEPTED: 'ACCEPTED',
    WA: 'WA',
    TLE: 'TLE',
    MLE: 'MLE',
    RE: 'RE',
    CE: 'CE'
};
export const LanguageSlug = {
    CPP17: 'cpp17',
    JAVA21: 'java21',
    PYTHON3: 'python3'
};
export const ProblemDifficulty = {
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD'
};
// --- New Enums ---
export const ReportType = {
    BUG: 'BUG',
    SUGGESTION: 'SUGGESTION',
    OTHER: 'OTHER'
};
export const ReportStatus = {
    PENDING: 'PENDING',
    RESOLVED: 'RESOLVED',
    REJECTED: 'REJECTED'
};
export const FriendshipStatus = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    BLOCKED: 'BLOCKED'
};
export const MatchStatus = {
    PENDING: 'PENDING',
    PLAYING: 'PLAYING',
    FINISHED: 'FINISHED'
};
export const RoomStatus = {
    WAITING: 'WAITING',
    PLAYING: 'PLAYING',
    FINISHED: 'FINISHED'
};
export const NotificationType = {
    FRIEND_REQUEST: 'FRIEND_REQUEST',
    FRIEND_ACCEPTED: 'FRIEND_ACCEPTED',
    MATCH_FOUND: 'MATCH_FOUND',
    MATCH_STARTED: 'MATCH_STARTED',
    MATCH_ENDED: 'MATCH_ENDED',
    CONTEST_STARTING: 'CONTEST_STARTING',
    CONTEST_ENDED: 'CONTEST_ENDED',
    PROBLEM_SOLVED: 'PROBLEM_SOLVED',
    BADGE_EARNED: 'BADGE_EARNED',
    ROOM_INVITE: 'ROOM_INVITE',
    SYSTEM: 'SYSTEM',
    RATING_CHANGE: 'RATING_CHANGE',
    NEW_COMMENT: 'NEW_COMMENT',
    REPORT_RESOLVED: 'REPORT_RESOLVED'
};
export const ContestStatus = {
    UPCOMING: 'UPCOMING',
    ONGOING: 'ONGOING',
    ENDED: 'ENDED'
};
export const ShopItemCategory = {
    AVATAR: 'AVATAR',
    BADGE: 'BADGE',
    THEME: 'THEME',
    STICKER: 'STICKER',
    EFFECT: 'EFFECT',
    OTHER: 'OTHER'
};
export const CommentTargetType = {
    PROBLEM: 'PROBLEM',
    CONTEST: 'CONTEST',
    SUBMISSION: 'SUBMISSION'
};
