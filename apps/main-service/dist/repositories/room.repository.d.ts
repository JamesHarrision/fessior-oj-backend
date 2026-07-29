import { CustomRoomStatus, Difficulty } from '@prisma/client';
export declare class RoomRepository {
    create(data: {
        roomCode: string;
        creatorId: string;
        problemId?: string;
        difficulty?: Difficulty;
        timeLimit?: number;
        memoryLimit?: number;
        maxParticipants?: number;
    }): Promise<{
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
            is_ready: boolean;
            joined_at: Date;
            room_id: string;
        })[];
        creator: {
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.CustomRoomStatus;
        match_id: string | null;
        room_code: string;
        difficulty: import(".prisma/client").$Enums.Difficulty | null;
        time_limit: number | null;
        memory_limit: number | null;
        max_participants: number;
        creator_id: string;
    }>;
    findByCode(roomCode: string): Promise<{
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
            is_ready: boolean;
            joined_at: Date;
            room_id: string;
        })[];
        creator: {
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.CustomRoomStatus;
        match_id: string | null;
        room_code: string;
        difficulty: import(".prisma/client").$Enums.Difficulty | null;
        time_limit: number | null;
        memory_limit: number | null;
        max_participants: number;
        creator_id: string;
    }>;
    findById(id: string): Promise<{
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
            is_ready: boolean;
            joined_at: Date;
            room_id: string;
        })[];
        creator: {
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.CustomRoomStatus;
        match_id: string | null;
        room_code: string;
        difficulty: import(".prisma/client").$Enums.Difficulty | null;
        time_limit: number | null;
        memory_limit: number | null;
        max_participants: number;
        creator_id: string;
    }>;
    findActiveRooms(): Promise<({
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
            is_ready: boolean;
            joined_at: Date;
            room_id: string;
        })[];
        creator: {
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        };
        _count: {
            participants: number;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.CustomRoomStatus;
        match_id: string | null;
        room_code: string;
        difficulty: import(".prisma/client").$Enums.Difficulty | null;
        time_limit: number | null;
        memory_limit: number | null;
        max_participants: number;
        creator_id: string;
    })[]>;
    findCurrentActiveRoom(userId: string): Promise<{
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
            is_ready: boolean;
            joined_at: Date;
            room_id: string;
        })[];
        creator: {
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.CustomRoomStatus;
        match_id: string | null;
        room_code: string;
        difficulty: import(".prisma/client").$Enums.Difficulty | null;
        time_limit: number | null;
        memory_limit: number | null;
        max_participants: number;
        creator_id: string;
    }>;
    join(id: string, userId: string): Promise<{
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
            is_ready: boolean;
            joined_at: Date;
            room_id: string;
        })[];
        creator: {
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.CustomRoomStatus;
        match_id: string | null;
        room_code: string;
        difficulty: import(".prisma/client").$Enums.Difficulty | null;
        time_limit: number | null;
        memory_limit: number | null;
        max_participants: number;
        creator_id: string;
    }>;
    leave(roomId: string, userId: string): Promise<void>;
    updateStatus(id: string, status: CustomRoomStatus, matchId?: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.CustomRoomStatus;
        match_id: string | null;
        room_code: string;
        difficulty: import(".prisma/client").$Enums.Difficulty | null;
        time_limit: number | null;
        memory_limit: number | null;
        max_participants: number;
        creator_id: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        problem_id: string | null;
        status: import(".prisma/client").$Enums.CustomRoomStatus;
        match_id: string | null;
        room_code: string;
        difficulty: import(".prisma/client").$Enums.Difficulty | null;
        time_limit: number | null;
        memory_limit: number | null;
        max_participants: number;
        creator_id: string;
    }>;
}
export declare const roomRepository: RoomRepository;
