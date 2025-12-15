import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LikeService {
  private baseUrl = 'http://localhost:8080/api/likes';
  constructor(private http: HttpClient) {}

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/post/${postId}`, {});
  }

  unlikePost(postId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/post/${postId}`);
  }
}