import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PostService, PostDTO } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css',
})
export class Subscriptions implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postService = inject(PostService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly commentService = inject(CommentService);

  readonly posts = signal<PostDTO[]>([]);
  readonly loading = signal(false);
  readonly showComments = signal<Set<number>>(new Set());
  readonly commentInputs = signal<Map<number, string>>(new Map());

  ngOnInit() {
    this.loadFollowedPosts();
  }

  loadFollowedPosts() {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.loading.set(true);

    // Fetch subscriptions first
    this.userService.getMySubscriptions().subscribe({
      next: (subs) => {
        const followedIds = new Set(subs.map((s: any) => s.targetUser?.id || s.targetId));

        // Then fetch all posts and filter
        this.postService.getAllPosts().subscribe({
          next: (allPosts) => {
            const filteredPosts = allPosts.filter(post => followedIds.has(post.authorId));
            this.posts.set(filteredPosts);
            this.loading.set(false);
          },
          error: () => {
            this.notificationService.error('Failed to load posts');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.notificationService.error('Failed to load subscriptions');
        this.loading.set(false);
      }
    });
  }

  onLike(post: any) {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.info('Please log in to like posts');
      return;
    }

    if (post.isLiked) {
      this.postService.unlikePost(post.id).subscribe(() => {
        post.isLiked = false;
        post.likesCount = (post.likesCount || 0) - 1;
        this.posts.update(p => [...p]);
      });
    } else {
      this.postService.likePost(post.id).subscribe(() => {
        post.isLiked = true;
        post.likesCount = (post.likesCount || 0) + 1;
        this.posts.update(p => [...p]);
      });
    }
  }

  toggleComments(postId: number) {
    this.showComments.update(set => {
      const newSet = new Set(set);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
        this.loadComments(postId);
      }
      return newSet;
    });
  }

  loadComments(postId: number) {
    const post = this.posts().find(p => p.id === postId);
    if (post && !post.comments) {
      this.commentService.getCommentsByPost(postId).subscribe(comments => {
        post.comments = comments;
        this.posts.update(p => [...p]);
      });
    }
  }

  getCommentInput(postId: number): string {
    return this.commentInputs().get(postId) || '';
  }

  setCommentInput(postId: number, value: string) {
    this.commentInputs.update(map => {
      const newMap = new Map(map);
      newMap.set(postId, value);
      return newMap;
    });
  }

  onSubmitComment(postId: number) {
    if (!this.authService.isLoggedIn()) return;

    const content = this.getCommentInput(postId);
    if (!content.trim()) return;

    this.commentService.addComment(postId, content).subscribe(comment => {
      const post = this.posts().find(p => p.id === postId);
      if (post) {
        if (!post.comments) post.comments = [];
        post.comments.push(comment);
        post.commentsCount = (post.commentsCount || 0) + 1;
        this.setCommentInput(postId, '');
        this.posts.update(p => [...p]);
        this.notificationService.success('Comment added!');
      }
    });
  }
}
