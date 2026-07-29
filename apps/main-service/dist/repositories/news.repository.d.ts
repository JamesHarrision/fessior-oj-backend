export declare class NewsRepository {
    create(data: {
        title: string;
        content: string;
        authorId: string;
    }): Promise<{
        author: {
            id: string;
            username: string;
            avatar_url: string;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        content: string;
        author_id: string;
    }>;
    findList(page: number, limit: number): Promise<{
        total: number;
        page: number;
        limit: number;
        items: ({
            author: {
                id: string;
                username: string;
                avatar_url: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            title: string;
            content: string;
            author_id: string;
        })[];
    }>;
    findById(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        content: string;
        author_id: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        content: string;
        author_id: string;
    }>;
}
export declare const newsRepository: NewsRepository;
