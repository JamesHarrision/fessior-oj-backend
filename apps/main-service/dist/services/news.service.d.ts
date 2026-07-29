export declare class NewsService {
    createNews(authorId: string, data: {
        title: string;
        content: string;
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
    getNews(page?: number, limit?: number): Promise<{
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
    deleteNews(id: string, userRole: string): Promise<{
        success: boolean;
    }>;
}
export declare const newsService: NewsService;
