import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    // add other fields returned by backend if needed (e.g., username, roles)
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
    private baseUrl = 'http://localhost:8080/api/auth';

    constructor(private http: HttpClient) { }

    login(payload: LoginRequest): Observable<LoginResponse> {
        const url = `${this.baseUrl}/login`;
        return this.http.post<LoginResponse>(url, payload).pipe(
            tap((res) => {
                if (res && res.token) {
                    localStorage.setItem('auth_token', res.token);
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
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

}