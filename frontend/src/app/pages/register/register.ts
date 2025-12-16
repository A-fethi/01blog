import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
    username = '';
    email = '';
    password = '';
    selectedFile: File | null = null;
    loading = false;
    error: string | null = null;

    constructor(
      private authService: AuthService,
      private router: Router,
      private notificationService: NotificationService
    ) {}

    onFileSelected(event: any) {
      this.selectedFile = event.target.files[0] ?? null;
    }

    onSubmit() {
        this.loading = true;
        this.error = null;

        const formData = new FormData();
        formData.append('username', this.username);
        formData.append('email', this.email);
        formData.append('password', this.password);
        if (this.selectedFile) {
            formData.append('avatar', this.selectedFile);
        }

        this.authService.register(formData).subscribe({
            next: () => {
                this.loading = false;
                this.notificationService.success('Account created successfully. You can now log in.');
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.loading = false;
                // Backend errors may have shape: { message, error, errors: {...} }
                const fieldErrors = err?.error?.errors;
                if (fieldErrors && typeof fieldErrors === 'object') {
                  const firstKey = Object.keys(fieldErrors)[0];
                  this.error = fieldErrors[firstKey] ?? 'Invalid input data';
                } else {
                  this.error =
                    err?.error?.message ||
                    err?.error?.details ||
                    err?.error?.error ||
                    'Registration failed';
                }

                this.notificationService.error(this.error);
            },
        });
    }

}
