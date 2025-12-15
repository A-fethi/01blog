import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommentDTO {
  id: number;
  content: string;
  commentUsername: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private baseUrl = 'http://localhost:8080/api/comments';
  constructor(private http: HttpClient) { }

  getCommentsByPost(postId: number): Observable<CommentDTO[]> {
    return this.http.get<CommentDTO[]>(`${this.baseUrl}/post/${postId}`);
  }

  addComment(postId: number, content: string): Observable<CommentDTO> {
    return this.http.post<CommentDTO>(`${this.baseUrl}/post/${postId}`, { content });
  }
}