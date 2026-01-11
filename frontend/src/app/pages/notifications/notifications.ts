import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InAppNotificationService, NotificationDTO } from '../../services/in-app-notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterModule
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  authService = inject(AuthService);
  notificationService = inject(InAppNotificationService);
  router = inject(Router);

  notifications = signal<NotificationDTO[]>([]);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications.set(notifications);
      this.notificationService.refreshUnreadCount();
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  onNotificationClick(notification: NotificationDTO): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.read = true;
        this.notificationService.refreshUnreadCount();
      });
    }

    // Navigation logic based on type
    if (notification.type === 'FOLLOW') {
      if (this.authService.currentUser()?.username === notification.actorUsername) {
        this.router.navigate(['/block']);
      } else {
        this.router.navigate(['/block', notification.actorUsername]);
      }
    } else if (notification.type === 'REPORT' && this.authService.isAdmin()) {
      this.router.navigate(['/admin'], { queryParams: { tab: 'reports' } });
    } else if (notification.postId) {
      this.router.navigate(['/home'], { queryParams: { postId: notification.postId } });
    }
  }

  toggleReadStatus(event: Event, notification: NotificationDTO): void {
    event.stopPropagation();
    if (notification.read) {
      this.notificationService.markAsUnread(notification.id).subscribe(() => {
        notification.read = false;
        this.notificationService.refreshUnreadCount();
      });
    } else {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.read = true;
        this.notificationService.refreshUnreadCount();
      });
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'LIKE': return 'favorite';
      case 'COMMENT': return 'comment';
      case 'FOLLOW': return 'person_add';
      case 'NEW_POST': return 'article';
      case 'REPORT': return 'report';
      default: return 'notifications';
    }
  }
}
