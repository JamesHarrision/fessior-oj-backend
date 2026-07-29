export declare class FriendshipRepository {
    findFriendship(userId1: string, userId2: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        sender_id: string;
        receiver_id: string;
    }>;
    sendRequest(senderId: string, receiverId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        sender_id: string;
        receiver_id: string;
    }>;
    acceptRequest(senderId: string, receiverId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        sender_id: string;
        receiver_id: string;
    }>;
    declineRequest(senderId: string, receiverId: string): Promise<{
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
    getFriendships(userId: string, page: number, limit: number): Promise<{
        total: number;
        page: number;
        limit: number;
        items: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: import(".prisma/client").$Enums.FriendshipStatus;
            sender_id: string;
            receiver_id: string;
        }[];
    }>;
    getPendingRequests(userId: string): Promise<{
        incoming: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: import(".prisma/client").$Enums.FriendshipStatus;
            sender_id: string;
            receiver_id: string;
        }[];
        outgoing: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: import(".prisma/client").$Enums.FriendshipStatus;
            sender_id: string;
            receiver_id: string;
        }[];
    }>;
}
export declare const friendshipRepository: FriendshipRepository;
