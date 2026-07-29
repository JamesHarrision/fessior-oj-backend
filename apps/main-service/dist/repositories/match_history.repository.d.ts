export declare class MatchHistoryRepository {
    getHistory(userId: string, page: number, limit: number): Promise<{
        total: number;
        page: number;
        limit: number;
        items: ({
            player2: {
                id: string;
                username: string;
                avatar_url: string;
                elo_rating: number;
            };
            participants: ({
                user: {
                    id: string;
                    username: string;
                    avatar_url: string;
                    elo_rating: number;
                };
            } & {
                id: string;
                user_id: string;
                status: import(".prisma/client").$Enums.PlayerMatchStatus;
                match_id: string;
                joined_at: Date;
                score_change: number;
                is_winner: boolean;
            })[];
            player1: {
                id: string;
                username: string;
                avatar_url: string;
                elo_rating: number;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            problem_id: string;
            winner_id: string | null;
            status: import(".prisma/client").$Enums.MatchStatus;
            player1_status: import(".prisma/client").$Enums.PlayerMatchStatus;
            player2_status: import(".prisma/client").$Enums.PlayerMatchStatus;
            player2_id: string | null;
            player1_id: string | null;
        })[];
    }>;
    findById(matchId: string): Promise<{
        player2: {
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        };
        participants: ({
            user: {
                id: string;
                username: string;
                avatar_url: string;
                elo_rating: number;
            };
        } & {
            id: string;
            user_id: string;
            status: import(".prisma/client").$Enums.PlayerMatchStatus;
            match_id: string;
            joined_at: Date;
            score_change: number;
            is_winner: boolean;
        })[];
        player1: {
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string;
        winner_id: string | null;
        status: import(".prisma/client").$Enums.MatchStatus;
        player1_status: import(".prisma/client").$Enums.PlayerMatchStatus;
        player2_status: import(".prisma/client").$Enums.PlayerMatchStatus;
        player2_id: string | null;
        player1_id: string | null;
    }>;
    findActiveMatchByUserId(userId: string): Promise<{
        player2: {
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        };
        participants: ({
            user: {
                id: string;
                username: string;
                avatar_url: string;
                elo_rating: number;
            };
        } & {
            id: string;
            user_id: string;
            status: import(".prisma/client").$Enums.PlayerMatchStatus;
            match_id: string;
            joined_at: Date;
            score_change: number;
            is_winner: boolean;
        })[];
        player1: {
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string;
        winner_id: string | null;
        status: import(".prisma/client").$Enums.MatchStatus;
        player1_status: import(".prisma/client").$Enums.PlayerMatchStatus;
        player2_status: import(".prisma/client").$Enums.PlayerMatchStatus;
        player2_id: string | null;
        player1_id: string | null;
    }>;
    delete(matchId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string;
        winner_id: string | null;
        status: import(".prisma/client").$Enums.MatchStatus;
        player1_status: import(".prisma/client").$Enums.PlayerMatchStatus;
        player2_status: import(".prisma/client").$Enums.PlayerMatchStatus;
        player2_id: string | null;
        player1_id: string | null;
    }>;
}
export declare const matchHistoryRepository: MatchHistoryRepository;
