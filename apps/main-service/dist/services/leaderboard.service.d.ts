export declare class LeaderboardService {
    getLeaderboard(page?: number, limit?: number): Promise<{
        total: number;
        page: number;
        limit: number;
        items: {
            id: string;
            username: string;
            elo: number;
            streak: number;
            highest_streak: number;
            created_at: Date;
        }[];
    }>;
}
export declare const leaderboardService: LeaderboardService;
