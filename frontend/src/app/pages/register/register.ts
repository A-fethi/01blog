import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    loading = false;
    error: string | null = null;

    constructor(private authService: AuthService, private router: Router) {}

    onSubmit() {
        this.loading = true;
        this.error = null;

        this.authService.register({
            username: this.username,
            email: this.email,
            password: this.password,
        }).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error.message;
            },
        });
    }

}
