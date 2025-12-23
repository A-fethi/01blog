import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, UserDTO } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PostService, PostDTO } from '../../services/post.service';
import { NotificationService } from '../../services/notification.service';
import { CommentService } from '../../services/comment.service';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { UserListModal } from '../../components/user-list-modal/user-list-modal';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { ReportService } from '../../services/report.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReportDialog } from '../../components/report-dialog/report-dialog';

@Component({
    selector: 'app-block',
    imports: [CommonModule, MatIconModule, RouterModule, FormsModule, UserListModal, ConfirmModal],
    templateUrl: './block.html',
    styleUrl: './block.css',
})
export class Block implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);
    private readonly postService = inject(PostService);
    private readonly notificationService = inject(NotificationService);
    private readonly commentService = inject(CommentService);
    private readonly reportService = inject(ReportService);
    private readonly dialog = inject(MatDialog);

    // Signals
    readonly loading = signal(false);
    readonly profileUser = signal<UserDTO | null>(null);
    readonly userPosts = signal<PostDTO[]>([]);
    readonly followersCount = signal(0);
    readonly followingCount = signal(0);
    readonly isFollowing = signal(false);
    readonly followedUserIds = signal<Set<number>>(new Set());
    readonly showComments = signal<Set<number>>(new Set());
    readonly commentInputs = signal<Map<number, string>>(new Map());

    // Editing states
    readonly editingProfile = signal(false);
    readonly editUsername = signal('');
    readonly editEmail = signal('');
    readonly editAvatarFile = signal<File | null>(null);

    readonly editingPostId = signal<number | null>(null);
    readonly editPostTitle = signal('');
    readonly editPostContent = signal('');

    readonly editingCommentId = signal<number | null>(null);
    readonly editCommentContent = signal('');

    // Modal Signals
    readonly showModal = signal(false);
    readonly modalTitle = signal('');
    readonly modalUsers = signal<any[]>([]);

    // Confirmation Modal State
    readonly showConfirmModal = signal(false);
    readonly confirmModalTitle = signal('');
    readonly confirmModalMessage = signal('');
    private confirmAction: (() => void) | null = null;

    // Computed
    readonly isOwnProfile = computed(() => {
        const current = this.authService.currentUser();
        const profile = this.profileUser();
        return current && profile && current.id === profile.id;
    });

    readonly postsCount = computed(() => this.userPosts().length);

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const username = params.get('username');
            if (username) {
                this.loadUserProfile(username);
            } else {
                this.loadOwnProfile();
            }
        });
    }

    loadOwnProfile() {
        const currentUser = this.authService.currentUser();
        if (!currentUser) {
            this.router.navigate(['/login']);
            return;
        }
        this.profileUser.set(currentUser);
        this.loadUserData(currentUser.username);
    }

    loadUserProfile(username: string) {
        this.loading.set(true);
        this.userService.getUserByUsername(username).subscribe({
            next: (user) => {
                this.profileUser.set(user);
                this.loadUserData(username);
                this.checkIfFollowing(user.id);
            },
            error: () => {
                this.notificationService.error('User not found');
                this.router.navigate(['/home']);
                this.loading.set(false);
            }
        });
    }

    loadUserData(username: string) {
        this.loading.set(true);
        forkJoin({
            posts: this.postService.getPostsByUsername(username),
            followerCount: this.userService.getFollowerCount(username)
        }).subscribe({
            next: ({ posts, followerCount }) => {
                this.userPosts.set(posts);
                this.followersCount.set(followerCount.count);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });

        this.userService.getFollowing(username).subscribe({
            next: (following) => {
                this.followingCount.set(following.length);
            }
        });
    }

    checkIfFollowing(userId: number) {
        if (!this.authService.isLoggedIn()) return;
        this.userService.getMySubscriptions().subscribe({
            next: (subscriptions) => {
                const isFollowing = subscriptions.some((s: any) => s.targetUser?.id === userId);
                this.isFollowing.set(isFollowing);
            }
        });
    }

    onFollowToggle() {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }
        const user = this.profileUser();
        if (!user) return;

        if (this.isFollowing()) {
            this.userService.unfollowUser(user.id).subscribe({
                next: () => {
                    this.isFollowing.set(false);
                    this.followersCount.update(c => c - 1);
                    this.notificationService.success(`Unfollowed ${user.username}`);
                }
            });
        } else {
            this.userService.followUser(user.id).subscribe({
                next: () => {
                    this.isFollowing.set(true);
                    this.followersCount.update(c => c + 1);
                    this.notificationService.success(`Following ${user.username}`);
                }
            });
        }
    }

    onReportUser() {
        const user = this.profileUser();
        if (!user || !this.authService.isLoggedIn()) {
            if (!this.authService.isLoggedIn()) this.router.navigate(['/login']);
            return;
        }

        const dialogRef = this.dialog.open(ReportDialog, {
            data: { type: 'user', targetName: user.username }
        });

        dialogRef.afterClosed().subscribe(reason => {
            if (reason) {
                this.reportService.reportUser(user.id, reason).subscribe({
                    next: () => this.notificationService.success('Report submitted successfully'),
                    error: () => this.notificationService.error('Failed to submit report')
                });
            }
        });
    }

    onReportPost(post: any) {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }

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

    // Profile Editing
    onEditProfile() {
        const user = this.profileUser();
        if (!user) return;
        this.editUsername.set(user.username);
        this.editEmail.set(user.email || '');
        this.editAvatarFile.set(null);
        this.editingProfile.set(true);
    }

    onCancelEditProfile() {
        this.editingProfile.set(false);
    }

    onAvatarSelected(event: any) {
        this.editAvatarFile.set(event.target.files[0] ?? null);
    }

    onUpdateProfile() {
        const formData = new FormData();
        formData.append('username', this.editUsername());
        formData.append('email', this.editEmail());
        if (this.editAvatarFile()) {
            formData.append('avatar', this.editAvatarFile()!);
        }

        this.userService.updateProfile(formData).subscribe({
            next: (updatedUser) => {
                this.profileUser.set(updatedUser);
                this.authService.currentUser.set(updatedUser);
                this.editingProfile.set(false);
                this.notificationService.success('Profile updated!');
                // If username changed, we might need to navigate to new URL
                if (updatedUser.username !== this.editUsername()) {
                    this.router.navigate(['/block', updatedUser.username]);
                }
            },
            error: (err) => this.notificationService.error(err?.error?.message || 'Failed to update profile')
        });
    }

    // Modal Methods
    openFollowersModal() {
        const user = this.profileUser();
        if (!user) return;
        this.userService.getFollowers(user.username).subscribe(users => {
            this.modalTitle.set('Followers');
            const mappedUsers = users.map((u: any) => ({
                username: u.subscriberUsername,
                avatarUrl: u.subscriberAvatarUrl,
                id: u.subscriberId
            }));
            this.modalUsers.set(mappedUsers);
            this.showModal.set(true);
        });
    }

    openFollowingModal() {
        const user = this.profileUser();
        if (!user) return;
        this.userService.getFollowing(user.username).subscribe(users => {
            this.modalTitle.set('Following');
            const mappedUsers = users.map((u: any) => ({
                username: u.targetUsername,
                avatarUrl: u.targetAvatarUrl,
                id: u.targetId
            }));
            this.modalUsers.set(mappedUsers);
            this.showModal.set(true);
        });
    }

    closeModal() {
        this.showModal.set(false);
    }

    // Post interaction methods
    onLike(post: any) {
        if (!this.authService.isLoggedIn()) {
            this.notificationService.info('Please log in to like posts');
            return;
        }
        if (post.isLiked) {
            this.postService.unlikePost(post.id).subscribe(() => {
                post.isLiked = false;
                post.likesCount = (post.likesCount || 0) - 1;
                this.userPosts.update(p => [...p]);
            });
        } else {
            this.postService.likePost(post.id).subscribe(() => {
                post.isLiked = true;
                post.likesCount = (post.likesCount || 0) + 1;
                this.userPosts.update(p => [...p]);
            });
        }
    }

    onEditPost(post: any) {
        this.editingPostId.set(post.id);
        this.editPostTitle.set(post.title || '');
        this.editPostContent.set(post.content || '');
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

        this.postService.updatePost(postId, formData).subscribe({
            next: (updatedPost) => {
                this.userPosts.update(posts => posts.map(p => p.id === postId ? { ...p, ...updatedPost } : p));
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
                    this.userPosts.update(posts => posts.filter(p => p.id !== postId));
                    this.notificationService.success('Post deleted!');
                },
                error: () => this.notificationService.error('Failed to delete post')
            });
        };
        this.confirmModalTitle.set('Delete Post');
        this.confirmModalMessage.set('Are you sure you want to delete this post? This action cannot be undone.');
        this.showConfirmModal.set(true);
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
        const post = this.userPosts().find(p => p.id === postId);
        if (post && !post.comments) {
            this.commentService.getCommentsByPost(postId).subscribe(comments => {
                post.comments = comments;
                this.userPosts.update(p => [...p]);
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
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }
        const content = this.getCommentInput(postId);
        if (!content.trim()) return;
        this.commentService.addComment(postId, content).subscribe(comment => {
            const post = this.userPosts().find(p => p.id === postId);
            if (post) {
                if (!post.comments) post.comments = [];
                post.comments.push(comment);
                post.commentsCount = (post.commentsCount || 0) + 1;
                this.setCommentInput(postId, '');
                this.userPosts.update(p => [...p]);
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
                const post = this.userPosts().find(p => p.id === postId);
                if (post && post.comments) {
                    post.comments = post.comments.map((c: any) => c.id === commentId ? updatedComment : c);
                }
                this.editingCommentId.set(null);
                this.userPosts.update(p => [...p]);
                this.notificationService.success('Comment updated!');
            },
            error: () => this.notificationService.error('Failed to update comment')
        });
    }

    onDeleteComment(postId: number, commentId: number) {
        this.confirmAction = () => {
            this.commentService.deleteComment(commentId).subscribe({
                next: () => {
                    const post = this.userPosts().find(p => p.id === postId);
                    if (post && post.comments) {
                        post.comments = post.comments.filter((c: any) => c.id !== commentId);
                        post.commentsCount = (post.commentsCount || 0) - 1;
                    }
                    this.userPosts.update(p => [...p]);
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
}
