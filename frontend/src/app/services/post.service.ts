import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PostDTO {
  id: number;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  authorId: number;
  authorUsername: string;
  authorAvatarUrl?: string;
  likesCount: number;
  commentsCount: number;
  comments?: any[];
  isLiked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private baseUrl = 'http://localhost:8080/api/posts';
  private likesUrl = 'http://localhost:8080/api/likes';

  constructor(private http: HttpClient) { }

  getAllPosts(): Observable<PostDTO[]> {
    return this.http.get<PostDTO[]>(this.baseUrl);
  }

  createPost(post: { title: string; content: string }): Observable<PostDTO> {
    return this.http.post<PostDTO>(this.baseUrl, post);
  }

  getPostsByUsername(username: string): Observable<PostDTO[]> {
    return this.http.get<PostDTO[]>(`${this.baseUrl}/user/${username}`);
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.likesUrl}/post/${postId}`, {});
  }

  unlikePost(postId: number): Observable<any> {
    return this.http.delete(`${this.likesUrl}/post/${postId}`);
  }
}