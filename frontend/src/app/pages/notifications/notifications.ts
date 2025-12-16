import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

interface Notification {
  icon: string;
  message: string;
  time: string;
  unread: boolean;
}

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
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  notifications: Notification[] = [
    {
      icon: 'chat',
      message: `Alice commented on your post 'My First Angular Project'`,
      time: '5m ago',
      unread: true,
    },
    {
      icon: 'school',
      message: `Your submission for 'Data Structures' has been graded.`,
      time: '2h ago',
      unread: true,
    },
    {
      icon: 'alternate_email',
      message: `Bob mentioned you in a comment on 'Final Year Thesis Ideas'.`,
      time: 'Yesterday',
      unread: false,
    },
    {
      icon: 'group_add',
      message: `You have been invited to join the 'Advanced Algorithms' study group.`,
      time: '2 days ago',
      unread: false,
    },
  ];

  markAllAsRead(): void {
    this.notifications.forEach(n => (n.unread = false));
  }
}
