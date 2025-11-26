import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  username = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    this.loading = true;
    this.error = null;

    this.authService.login({
      username: this.username,
      password: this.password,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.notificationService.success('Logged in successfully');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        // Backend returns: { "error": "Invalid username or password" }
        // Fallback to a generic message if the shape changes.
        this.error =
          err?.error?.message ||
          err?.error?.error ||
          'Invalid username or password';

        this.notificationService.error(this.error);
      },
    });
  }
}
