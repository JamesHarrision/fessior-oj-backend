import { API_ROUTES } from '@ocj/constants';
import type { IComment, CommentTargetType, CreateCommentRequest, UpdateCommentRequest } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';

export class CommentRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getComments(targetId: string, targetType: CommentTargetType): Promise<ApiResponse<IComment[]>> {
    return this.http.request('GET', `${API_ROUTES.COMMENTS}?targetId=${encodeURIComponent(targetId)}&targetType=${encodeURIComponent(targetType)}`);
  }

  createComment(data: CreateCommentRequest): Promise<ApiResponse<IComment>> {
    return this.http.request('POST', API_ROUTES.COMMENTS, { body: data });
  }

  updateComment(id: string, data: UpdateCommentRequest): Promise<ApiResponse<IComment>> {
    return this.http.request('PUT', `${API_ROUTES.COMMENTS}/${id}`, { body: data });
  }

  deleteComment(id: string): Promise<ApiResponse<void>> {
    return this.http.request('DELETE', `${API_ROUTES.COMMENTS}/${id}`);
  }

  likeComment(id: string): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.COMMENTS}/${id}/like`);
  }

  unlikeComment(id: string): Promise<ApiResponse<void>> {
    return this.http.request('DELETE', `${API_ROUTES.COMMENTS}/${id}/like`);
  }
}
