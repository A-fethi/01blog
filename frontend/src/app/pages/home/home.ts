import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { ReportService } from '../../services/report.service';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReportDialog } from '../../components/report-dialog/report-dialog';

@Component({
    selector: 'app-home',
    imports: [CommonModule, MatIconModule, FormsModule, RouterModule, ConfirmModal],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home implements OnInit {
    readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly notificationService = inject(NotificationService);
    private readonly postService = inject(PostService);
    private readonly commentService = inject(CommentService);
    private readonly reportService = inject(ReportService);
    private readonly dialog = inject(MatDialog);
    private readonly route = inject(ActivatedRoute);

    readonly newPostTitle = signal('');
    readonly newPostContent = signal('');
    readonly selectedFile = signal<File | null>(null);
    readonly selectedFilePreview = signal<string | null>(null);
    readonly showComments = signal<Set<number>>(new Set());
    readonly commentInputs = signal<Map<number, string>>(new Map());
    readonly showUserMenu = signal(false);

    readonly posts = signal<any[]>([]);
    readonly loading = signal(false);

    // Editing states
    readonly editingPostId = signal<number | null>(null);
    readonly editPostTitle = signal('');
    readonly editPostContent = signal('');
    readonly editPostFile = signal<File | null>(null);

    readonly editingCommentId = signal<number | null>(null);
    readonly editCommentContent = signal('');

    // Confirmation Modal State
    readonly showConfirmModal = signal(false);
    readonly confirmModalTitle = signal('');
    readonly confirmModalMessage = signal('');
    private confirmAction: (() => void) | null = null;

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

                // Check for postId in query params to scroll to it
                this.route.queryParams.subscribe((params: Params) => {
                    const postId = params['postId'];
                    if (postId) {
                        setTimeout(() => {
                            const element = document.getElementById('post-' + postId);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                element.classList.add('highlight-post');
                                setTimeout(() => element.classList.remove('highlight-post'), 2000);
                            }
                        }, 100);
                    }
                });
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

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile.set(file);
            // Create a preview URL
            const reader = new FileReader();
            reader.onload = () => {
                this.selectedFilePreview.set(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    onSharePost() {
        if (!this.requireLogin()) return;

        const title = this.newPostTitle().trim() || 'Untitled Post';
        const content = this.newPostContent().trim();
        if (!content) {
            this.notificationService.error('Content is required');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        const file = this.selectedFile();
        if (file) {
            formData.append('file', file);
        }

        this.postService.createPost(formData).subscribe({
            next: (post) => {
                this.posts.update(p => [post, ...p]);
                this.newPostTitle.set('');
                this.newPostContent.set('');
                this.selectedFile.set(null);
                this.selectedFilePreview.set(null);
                this.notificationService.success('Post shared!');
            },
            error: (err) => {
                this.notificationService.error('Failed to share post');
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

    onEditPost(post: any) {
        this.editingPostId.set(post.id);
        this.editPostTitle.set(post.title || '');
        this.editPostContent.set(post.content || '');
        this.editPostFile.set(null);
    }

    onCancelEditPost() {
        this.editingPostId.set(null);
    }

    onUpdatePost() {
        const postId = this.editingPostId();
        if (!postId) return;

        const formData = new FormData();
        formData.append('title', this.editPostTitle());
        formData.append('content', this.editPostContent());
        if (this.editPostFile()) {
            formData.append('file', this.editPostFile()!);
        }

        this.postService.updatePost(postId, formData).subscribe({
            next: (updatedPost) => {
                this.posts.update(posts => posts.map(p => p.id === postId ? { ...p, ...updatedPost } : p));
                this.editingPostId.set(null);
                this.notificationService.success('Post updated!');
            },
            error: () => this.notificationService.error('Failed to update post')
        });
    }

    onDeletePost(postId: number) {
        this.confirmAction = () => {
            this.postService.deletePost(postId).subscribe({
                next: () => {
                    this.posts.update(posts => posts.filter(p => p.id !== postId));
                    this.notificationService.success('Post deleted!');
                },
                error: () => this.notificationService.error('Failed to delete post')
            });
        };
        this.confirmModalTitle.set('Delete Post');
        this.confirmModalMessage.set('Are you sure you want to delete this post? This action cannot be undone.');
        this.showConfirmModal.set(true);
    }

    onReportPost(post: any) {
        if (!this.requireLogin()) return;

        const dialogRef = this.dialog.open(ReportDialog, {
            data: { type: 'post', targetName: post.title || 'this post' }
        });

        dialogRef.afterClosed().subscribe(reason => {
            if (reason) {
                this.reportService.reportPost(post.id, reason).subscribe({
                    next: () => {
                        this.notificationService.success('Report submitted successfully');
                        post.showMenu = false;
                    },
                    error: () => this.notificationService.error('Failed to submit report')
                });
            }
        });
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

    onEditComment(comment: any) {
        this.editingCommentId.set(comment.id);
        this.editCommentContent.set(comment.content);
    }

    onCancelEditComment() {
        this.editingCommentId.set(null);
    }

    onUpdateComment(postId: number) {
        const commentId = this.editingCommentId();
        if (!commentId) return;

        this.commentService.updateComment(commentId, this.editCommentContent()).subscribe({
            next: (updatedComment) => {
                const post = this.posts().find(p => p.id === postId);
                if (post && post.comments) {
                    post.comments = post.comments.map((c: any) => c.id === commentId ? updatedComment : c);
                }
                this.editingCommentId.set(null);
                this.posts.update(p => [...p]);
                this.notificationService.success('Comment updated!');
            },
            error: () => this.notificationService.error('Failed to update comment')
        });
    }

    onDeleteComment(postId: number, commentId: number) {
        this.confirmAction = () => {
            this.commentService.deleteComment(commentId).subscribe({
                next: () => {
                    const post = this.posts().find(p => p.id === postId);
                    if (post && post.comments) {
                        post.comments = post.comments.filter((c: any) => c.id !== commentId);
                        post.commentsCount = (post.commentsCount || 0) - 1;
                    }
                    this.posts.update(p => [...p]);
                    this.notificationService.success('Comment deleted!');
                },
                error: () => this.notificationService.error('Failed to delete comment')
            });
        };
        this.confirmModalTitle.set('Delete Comment');
        this.confirmModalMessage.set('Are you sure you want to delete this comment?');
        this.showConfirmModal.set(true);
    }

    onConfirmAction() {
        if (this.confirmAction) {
            this.confirmAction();
            this.confirmAction = null;
        }
        this.showConfirmModal.set(false);
    }

    onCancelConfirm() {
        this.confirmAction = null;
        this.showConfirmModal.set(false);
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
