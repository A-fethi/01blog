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
      this.router.navigate(['/block', notification.actorUsername]);
    } else if (notification.type === 'REPORT' && this.authService.isAdmin()) {
      this.router.navigate(['/admin'], { queryParams: { tab: 'reports' } });
    } else if (notification.postId) {
      this.router.navigate(['/home'], { queryParams: { postId: notification.postId } });
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'LIKE': return 'favorite';
      case 'COMMENT': return 'comment';
      case 'FOLLOW': return 'person_add';
      case 'NEW_POST': return 'article';
      case 'SHARE': return 'share';
      case 'REPORT': return 'report';
      default: return 'notifications';
    }
  }
}
