export declare class CommentService {
    createComment(userId: string, data: {
        targetId: string;
        targetType: string;
        content: string;
        parentId?: string;
    }): Promise<{
        parent: {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            content: string;
            target_id: string;
            target_type: string;
            parent_id: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        content: string;
        target_id: string;
        target_type: string;
        parent_id: string | null;
    }>;
    getComments(targetId: string, targetType: string, page?: number, limit?: number): Promise<{
        items: {
            user: {
                id: string;
                username: string;
                avatar_url: string;
                elo_rating: number;
            };
            likeCount: number;
            replies: {
                user: {
                    id: string;
                    username: string;
                    avatar_url: string;
                    elo_rating: number;
                };
                likeCount: number;
                likes: {
                    user_id: string;
                }[];
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                content: string;
                target_id: string;
                target_type: string;
                parent_id: string | null;
            }[];
            likes: {
                user_id: string;
            }[];
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            content: string;
            target_id: string;
            target_type: string;
            parent_id: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateComment(commentId: string, userId: string, content: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        content: string;
        target_id: string;
        target_type: string;
        parent_id: string | null;
    }>;
    deleteComment(commentId: string, userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
    toggleLike(commentId: string, userId: string): Promise<{
        liked: boolean;
    }>;
}
export declare const commentService: CommentService;
