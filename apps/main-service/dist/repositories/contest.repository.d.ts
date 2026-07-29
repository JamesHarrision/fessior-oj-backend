export declare class ContestRepository {
    create(data: {
        title: string;
        description?: string;
        startTime: Date;
        endTime: Date;
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
    update(contestId: string, data: {
        title?: string;
        description?: string;
        startTime?: Date;
        endTime?: Date;
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
    delete(contestId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.ContestStatus;
        title: string;
        description: string | null;
        start_time: Date;
        end_time: Date;
    }>;
    findById(contestId: string): Promise<{
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
    findList(filter: 'all' | 'ongoing' | 'upcoming' | 'past'): Promise<({
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
    registerUser(contestId: string, userId: string): Promise<{
        user_id: string;
        contest_id: string;
        registered_at: Date;
    }>;
    unregisterUser(contestId: string, userId: string): Promise<{
        user_id: string;
        contest_id: string;
        registered_at: Date;
    }>;
    isRegistered(contestId: string, userId: string): Promise<boolean>;
}
export declare const contestRepository: ContestRepository;
