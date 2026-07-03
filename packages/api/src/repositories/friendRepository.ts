import { API_ROUTES } from '@ocj/constants';
import type { IFriendship } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';

export class FriendRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getFriends(): Promise<ApiResponse<IFriendship[]>> {
    return this.http.request('GET', `${API_ROUTES.FRIENDS}/list`);
  }

  getFriendRequests(): Promise<ApiResponse<IFriendship[]>> {
    return this.http.request('GET', `${API_ROUTES.FRIENDS}/requests`);
  }

  sendFriendRequest(userId: string): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.FRIENDS}/request`, { body: { userId } });
  }

  respondFriendRequest(userId: string, action: 'accept' | 'reject'): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.FRIENDS}/respond`, { body: { userId, action } });
  }

  blockUser(userId: string): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.FRIENDS}/block/${userId}`);
  }

  unblockUser(userId: string): Promise<ApiResponse<void>> {
    return this.http.request('DELETE', `${API_ROUTES.FRIENDS}/block/${userId}`);
  }
}
