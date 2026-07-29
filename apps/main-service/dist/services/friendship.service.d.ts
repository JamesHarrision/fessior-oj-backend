export declare class FriendshipService {
    sendRequest(senderId: string, receiverIdOrUsername: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        sender_id: string;
        receiver_id: string;
    }>;
    acceptRequest(userId: string, senderId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        sender_id: string;
        receiver_id: string;
    }>;
    declineRequest(userId: string, senderId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        sender_id: string;
        receiver_id: string;
    }>;
    removeFriendship(userId: string, friendId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        sender_id: string;
        receiver_id: string;
    }>;
    getFriends(userId: string, page?: number, limit?: number): Promise<{
        items: {
            online: boolean;
            id: string;
            username: string;
            avatar_url: string;
            elo_rating: number;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPendingRequests(userId: string): Promise<{
        incoming: {
            id: string;
            created_at: Date;
            sender: {
                id: string;
                username: string;
                avatar_url: string;
                elo_rating: number;
            };
        }[];
        outgoing: {
            id: string;
            created_at: Date;
            receiver: {
                id: string;
                username: string;
                avatar_url: string;
                elo_rating: number;
            };
        }[];
    }>;
}
export declare const friendshipService: FriendshipService;
