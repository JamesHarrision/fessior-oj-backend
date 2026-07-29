import { ReportStatus } from '@prisma/client';
export declare class ReportRepository {
    create(data: {
        userId: string;
        type: string;
        content: string;
        reportedUserId?: string;
        problemId?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        type: string;
        content: string;
        reported_user_id: string | null;
    }>;
    findList(filter: {
        userId?: string;
        status?: ReportStatus;
        page: number;
        limit: number;
    }): Promise<{
        total: number;
        page: number;
        limit: number;
        items: {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            problem_id: string | null;
            status: import(".prisma/client").$Enums.ReportStatus;
            type: string;
            content: string;
            reported_user_id: string | null;
        }[];
    }>;
    findById(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        type: string;
        content: string;
        reported_user_id: string | null;
    }>;
    updateStatus(id: string, status: ReportStatus): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        type: string;
        content: string;
        reported_user_id: string | null;
    }>;
}
export declare const reportRepository: ReportRepository;
