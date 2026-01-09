import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDTO {
    id: number;
    username: string;
    email: string;
    role: string;
    banned: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminStats {
    totalUsers: number;
    regularUsers: number;
    totalPosts?: number;
    totalReports?: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private baseUrl = 'http://localhost:8080/api/admin';

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<UserDTO[]> {
        return this.http.get<UserDTO[]>(`${this.baseUrl}/users`);
    }

    getDashboardStats(): Observable<AdminStats> {
        return this.http.get<AdminStats>(`${this.baseUrl}/stats`);
    }

    deleteUser(userId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/users/${userId}`);
    }

    banUser(userId: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/users/${userId}/ban`, {});
    }

    unbanUser(userId: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/users/${userId}/unban`, {});
    }

    getAllPosts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/posts`);
    }

    deletePost(postId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/posts/${postId}`);
    }

    hidePost(postId: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/posts/${postId}/hide`, {});
    }

    unhidePost(postId: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/posts/${postId}/unhide`, {});
    }

    getReports(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/reports`);
    }

    updateReportStatus(reportId: number, status: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/reports/${reportId}/status/${status}`, {});
    }
}
