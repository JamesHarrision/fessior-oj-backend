import type { IComment, CommentTargetType, CreateCommentRequest, UpdateCommentRequest } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class CommentRepository {
    private readonly http;
    constructor(http: HttpClient);
    getComments(targetId: string, targetType: CommentTargetType): Promise<ApiResponse<IComment[]>>;
    createComment(data: CreateCommentRequest): Promise<ApiResponse<IComment>>;
    updateComment(id: string, data: UpdateCommentRequest): Promise<ApiResponse<IComment>>;
    deleteComment(id: string): Promise<ApiResponse<void>>;
    likeComment(id: string): Promise<ApiResponse<void>>;
    unlikeComment(id: string): Promise<ApiResponse<void>>;
}
