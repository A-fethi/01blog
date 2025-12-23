import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Report {
    id?: number;
    reportedId?: number; // reporter id
    reportedUserId?: number;
    reportedPostId?: number;
    reportedUsername?: string;
    reason: string;
    status?: 'PENDING' | 'RESOLVED' | 'REJECTED';
    createdAt?: string;
    resolvedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/reports';

    reportUser(userId: number, reason: string): Observable<Report> {
        return this.http.post<Report>(`${this.apiUrl}/users/${userId}`, { reason });
    }

    reportPost(postId: number, reason: string): Observable<Report> {
        return this.http.post<Report>(`${this.apiUrl}/posts/${postId}`, { reason });
    }
}
