import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';

@Component({
    selector: 'app-home',
    imports: [CommonModule, MatIconModule, FormsModule, RouterModule],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home implements OnInit {
    readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly notificationService = inject(NotificationService);
    private readonly postService = inject(PostService);
    private readonly commentService = inject(CommentService);

    readonly newPostContent = signal('');
    readonly showComments = signal<Set<number>>(new Set());
    readonly commentInputs = signal<Map<number, string>>(new Map());
    readonly showUserMenu = signal(false);

    readonly posts = signal<any[]>([]);
    readonly loading = signal(false);

    readonly currentUser = computed(() => {
        const user = this.authService.currentUser();
        return user ? {
            name: user.username,
            handle: '@' + user.username,
            avatarUrl: user.avatarUrl
        } : {
            name: 'Guest',
            handle: '@guest',
            avatarUrl: null
        };
    });

    ngOnInit() {
        this.loadFeed();
    }

    loadFeed() {
        this.loading.set(true);
        this.postService.getAllPosts().subscribe({
            next: (posts) => {
                this.posts.set(posts);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    private requireLogin(): boolean {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return false;
        }
        return true;
    }

    onSharePost() {
        if (!this.requireLogin()) return;

        const content = this.newPostContent().trim();
        if (!content) return;

        this.postService.createPost({ title: 'Post', content }).subscribe(post => {
            this.posts.update(p => [post, ...p]);
            this.newPostContent.set('');
            this.notificationService.success('Post shared!');
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
        if (!this.requireLogin()) return;

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

    onProfileClick() {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }
        this.showUserMenu.update(show => !show);
    }

    onLogout() {
        this.authService.logout();
        this.showUserMenu.set(false);
    }
}
