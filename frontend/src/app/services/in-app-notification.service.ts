import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface NotificationDTO {
  id: number;
  type: 'NEW_POST' | 'LIKE' | 'COMMENT' | 'SHARE' | 'REPORT' | 'FOLLOW';
  message: string;
  read: boolean;
  postId?: number;
  actorId?: number;
  actorUsername?: string;
  actorAvatarUrl?: string;
  targetId?: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class InAppNotificationService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/notifications';

  unreadCount = signal<number>(0);

  getNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(this.baseUrl);
  }

  markAsRead(notificationId: number): Observable<NotificationDTO> {
    return this.http.patch<NotificationDTO>(`${this.baseUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.baseUrl}/read-all`, {});
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/unread-count`).pipe(
      tap(res => this.unreadCount.set(res.count))
    );
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }
}
