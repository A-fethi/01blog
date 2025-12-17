import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from './auth.service';

export interface UserProfile extends UserDTO {
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
    isFollowing?: boolean;
}

export interface FollowResponse {
    message: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private baseUrl = 'http://localhost:8080/api/users';
    private subscriptionUrl = 'http://localhost:8080/api/subscriptions';

    constructor(private http: HttpClient) { }

    getUserByUsername(username: string): Observable<UserDTO> {
        return this.http.get<UserDTO>(`${this.baseUrl}/username/${username}`);
    }

    getUserById(id: number): Observable<UserDTO> {
        return this.http.get<UserDTO>(`${this.baseUrl}/${id}`);
    }

    getAllUsers(): Observable<UserDTO[]> {
        return this.http.get<UserDTO[]>(this.baseUrl);
    }

    // Subscription/Follow methods
    followUser(userId: number): Observable<any> {
        return this.http.post(`${this.subscriptionUrl}/${userId}`, {});
    }

    unfollowUser(userId: number): Observable<any> {
        return this.http.delete(`${this.subscriptionUrl}/${userId}`);
    }

    getMySubscriptions(): Observable<any[]> {
        return this.http.get<any[]>(this.subscriptionUrl);
    }

    getFollowerCount(username: string): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.subscriptionUrl}/${username}/followers`);
    }

    getFollowers(username: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.subscriptionUrl}/${username}/followers-list`);
    }

    getFollowing(username: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.subscriptionUrl}/${username}/following-list`);
    }

    // Get suggested users (users not followed by current user)
    getSuggestedUsers(limit: number = 5): Observable<UserDTO[]> {
        return this.http.get<UserDTO[]>(`${this.baseUrl}?limit=${limit}`);
    }
}