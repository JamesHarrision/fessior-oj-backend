import { Difficulty } from '@prisma/client';
export declare class RoomService {
    private broadcastActiveRooms;
    getCurrentRoom(userId: string): Promise<{
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
    createRoom(creatorId: string, data: {
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
    getActiveRooms(): Promise<({
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
    getRoomDetails(roomId: string): Promise<{
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
    joinRoom(roomCode: string, userId: string): Promise<{
        room: {
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
        };
    }>;
    kickPlayer(roomId: string, creatorId: string, targetUserId: string): Promise<{
        success: boolean;
    }>;
    startRoomMatch(roomId: string, creatorId: string): Promise<{
        room: {
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
        };
        matchId: string;
    }>;
    leaveRoom(roomId: string, userId: string): Promise<{
        success: boolean;
    }>;
    updateRoomConfig(roomId: string, creatorId: string, updates: any): Promise<{
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
    deleteRoom(roomId: string, creatorId: string): Promise<void>;
}
export declare const roomService: RoomService;
