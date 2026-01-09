import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  readonly username = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login({
      username: this.username().toLowerCase(),
      password: this.password(),
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.success('Logged in successfully');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg =
          err?.error?.message ||
          err?.error?.error ||
          'Invalid username or password';

        this.error.set(errorMsg);
        this.notificationService.error(errorMsg);
      },
    });
  }
}
