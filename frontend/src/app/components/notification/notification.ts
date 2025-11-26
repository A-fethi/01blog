import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class NotificationComponent {
  constructor(private notificationService: NotificationService) {}

  // Expose signals via getters to avoid using the service
  // before DI initialization.
  get visible() {
    return this.notificationService.visible;
  }

  get message() {
    return this.notificationService.message;
  }

  get type() {
    return this.notificationService.type;
  }

  get cssClass(): string {
    const t = this.notificationService.type();
    if (t === 'success') return 'toast toast-success';
    if (t === 'error') return 'toast toast-error';
    if (t === 'info') return 'toast toast-info';
    return 'toast';
  }

  close() {
    this.notificationService.clear();
  }
}


