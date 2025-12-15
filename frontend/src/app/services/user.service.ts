import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    private baseUrl = 'http://localhost:8080/api/users';
    constructor(private http: HttpClient) { }

    getUserByUsername(username: string): Observable<UserDTO> {
        return this.http.get<UserDTO>(`${this.baseUrl}/username/${username}`);
    }
}