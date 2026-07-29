export declare class CommentRepository {
    create(data: {
        targetId: string;
        targetType: string;
        userId: string;
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
    findList(targetId: string, targetType: string, page: number, limit: number): Promise<{
        total: number;
        page: number;
        limit: number;
        items: ({
            replies: ({
                likes: {
                    user_id: string;
                }[];
            } & {
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                content: string;
                target_id: string;
                target_type: string;
                parent_id: string | null;
            })[];
            likes: {
                user_id: string;
            }[];
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            content: string;
            target_id: string;
            target_type: string;
            parent_id: string | null;
        })[];
    }>;
    findById(id: string): Promise<{
        likes: {
            created_at: Date;
            user_id: string;
            comment_id: string;
        }[];
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
    update(id: string, content: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        content: string;
        target_id: string;
        target_type: string;
        parent_id: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        content: string;
        target_id: string;
        target_type: string;
        parent_id: string | null;
    }>;
    toggleLike(commentId: string, userId: string): Promise<{
        liked: boolean;
    }>;
}
export declare const commentRepository: CommentRepository;
