import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly message = signal<string | null>(null);
  readonly type = signal<NotificationType | null>(null);
  readonly visible = signal(false);

  private hideTimeoutId: any;

  private show(message: string | null, type: NotificationType, durationMs = 4000) {
    if (!message) {
      return;
    }

    this.message.set(message);
    this.type.set(type);
    this.visible.set(true);

    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
    }

    this.hideTimeoutId = setTimeout(() => {
      this.clear();
    }, durationMs);
  }

  success(message: string | null, durationMs?: number) {
    this.show(message, 'success', durationMs);
  }

  error(message: string | null, durationMs?: number) {
    this.show(message, 'error', durationMs);
  }

  info(message: string | null, durationMs?: number) {
    this.show(message, 'info', durationMs);
  }

  clear() {
    this.visible.set(false);
    this.message.set(null);
    this.type.set(null);
  }
}

