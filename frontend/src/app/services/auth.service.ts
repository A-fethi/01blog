import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    type: string;
    user: {
        id: number;
        username: string;
        email: string;
        role: string;
    }
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
}


@Injectable({ providedIn: 'root' })
export class AuthService {
    private baseUrl = 'http://localhost:8080/api/auth';
    private currentUserSubject = new BehaviorSubject<UserDTO | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        if (this.isLoggedIn()) {
            this.loadCurrentUser();
        }
    }

    login(payload: LoginRequest): Observable<LoginResponse> {
        const url = `${this.baseUrl}/login`;
        return this.http.post<LoginResponse>(url, payload).pipe(
            tap((res) => {
                if (res && res.token) {
                    localStorage.setItem('auth_token', res.token);
                    this.currentUserSubject.next(res.user);
                }
            })
        );
    }

    register(payload: RegisterRequest): Observable<RegisterRequest> {
        const url = `${this.baseUrl}/register`;
        return this.http.post<RegisterRequest>(url, payload);
    }

    logout() {
        localStorage.removeItem('auth_token');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    IsAdmin(): boolean {
        const user = this.currentUserSubject.value;
        return user?.role === 'ADMIN';
    }

    getCurrentUser(): Observable<UserDTO> {
        const url = `${this.baseUrl}/me`;
        return this.http.get<UserDTO>(url).pipe(
            tap((user) => {
                this.currentUserSubject.next(user);
            })
        );
    }

    private loadCurrentUser(): void {
        this.getCurrentUser().subscribe({
            error: (err) => {
                console.error('Failed to load current user:', err);
                this.logout();
            }
        });
    }

    getCurrentUserValue(): UserDTO | null {
        return this.currentUserSubject.value;
    }
}