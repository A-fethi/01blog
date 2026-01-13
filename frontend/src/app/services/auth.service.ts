import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { NotificationService } from './notification.service';

// Interfaces
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    type: string;
    user: UserDTO;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface UserDTO {
    id: number;
    username: string;
    email: string;
    role: string;
    avatarUrl?: string;
    banned?: boolean;
    createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly notificationService = inject(NotificationService);
    private readonly router = inject(Router);
    private readonly baseUrl = 'http://localhost:8080/api/auth';

    // Signals - Angular 21's recommended reactive primitive
    readonly currentUser = signal<UserDTO | null>(null);
    readonly isLoading = signal<boolean>(false);
    readonly isLoggedIn = computed(() => !!this.currentUser());
    readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
    readonly token = signal<string | null>(this.getStoredToken());

    constructor() {
        // Load user data if token exists
        if (this.token()) {
            this.loadCurrentUser();
        }
    }

    login(payload: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
            tap(res => {
                this.token.set(res.token);
                this.currentUser.set(res.user);
                localStorage.setItem('auth_token', res.token);
            })
        );
    }

    register(payload: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/register`, payload);
    }

    logout(): void {
        this.token.set(null);
        this.currentUser.set(null);
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
    }

    private getStoredToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    private loadCurrentUser(): void {
        this.isLoading.set(true);
        this.http.get<UserDTO>(`${this.baseUrl}/me`).subscribe({
            next: user => {
                this.currentUser.set(user);
                this.isLoading.set(false);
            },
            error: err => {
                this.notificationService.error('Session expired. Please log in again.');
                this.logout();
                this.isLoading.set(false);
            }
        });
    }
}
