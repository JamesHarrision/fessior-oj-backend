export declare class ContestService {
    createContest(data: {
        title: string;
        description?: string;
        startTime: string;
        endTime: string;
        problems?: {
            problemId: string;
            points?: number;
            order?: number;
        }[];
    }): Promise<{
        problems: {
            mongo_problem_id: string;
            points: number;
            order: number;
            contest_id: string;
        }[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.ContestStatus;
        title: string;
        description: string | null;
        start_time: Date;
        end_time: Date;
    }>;
    getContests(filter?: 'all' | 'ongoing' | 'upcoming' | 'past'): Promise<({
        _count: {
            problems: number;
            registrations: number;
        };
        registrations: {
            user_id: string;
        }[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.ContestStatus;
        title: string;
        description: string | null;
        start_time: Date;
        end_time: Date;
    })[]>;
    getContestDetails(contestId: string): Promise<{
        problems: {
            mongo_problem_id: string;
            points: number;
            order: number;
            contest_id: string;
        }[];
        registrations: {
            user_id: string;
        }[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.ContestStatus;
        title: string;
        description: string | null;
        start_time: Date;
        end_time: Date;
    }>;
    updateContest(contestId: string, data: {
        title?: string;
        description?: string;
        startTime?: string;
        endTime?: string;
        problems?: {
            problemId: string;
            points?: number;
            order?: number;
        }[];
    }): Promise<{
        problems: {
            mongo_problem_id: string;
            points: number;
            order: number;
            contest_id: string;
        }[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.ContestStatus;
        title: string;
        description: string | null;
        start_time: Date;
        end_time: Date;
    }>;
    deleteContest(contestId: string): Promise<{
        success: boolean;
    }>;
    register(contestId: string, userId: string): Promise<{
        user_id: string;
        contest_id: string;
        registered_at: Date;
    }>;
    unregister(contestId: string, userId: string): Promise<{
        user_id: string;
        contest_id: string;
        registered_at: Date;
    }>;
    getContestProblems(contestId: string, userId: string): Promise<{
        id: import("mongoose").Types.ObjectId;
        title: string;
        slug: string;
        difficulty: "EASY" | "MEDIUM" | "HARD";
        points: number;
        order: number;
    }[]>;
    getContestSubmissions(contestId: string, userId: string, requestUserRole: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/submission.model").ISubmission, {}, import("mongoose").DefaultSchemaOptions> & import("../models/submission.model").ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getLeaderboard(contestId: string): Promise<{
        userId: string;
        username: string;
        elo: number;
        avatarUrl: string;
        score: number;
        timePenalty: number;
        solvedCount: number;
    }[]>;
    endContest(contestId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export declare const contestService: ContestService;
