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

@Component({
    selector: 'app-block',
    imports: [CommonModule, MatIconModule, RouterModule, FormsModule, UserListModal],
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

    // Modal Signals
    readonly showModal = signal(false);
    readonly modalTitle = signal('');
    readonly modalUsers = signal<any[]>([]);

    // Computed
    readonly isOwnProfile = computed(() => {
        const current = this.authService.currentUser();
        const profile = this.profileUser();
        return current && profile && current.id === profile.id;
    });

    readonly postsCount = computed(() => this.userPosts().length);

    ngOnInit() {
        // Check if viewing own profile or another user's profile
        this.route.paramMap.subscribe(params => {
            const username = params.get('username');
            if (username) {
                // Viewing another user's profile
                this.loadUserProfile(username);
            } else {
                // Viewing own profile
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

        // Load following count (subscriptions)
        // For now, we don't have a direct endpoint for "following count of user X" in the snippet I saw,
        // but we can fetch the list or assume the user object has it if we updated UserDTO.
        // The snippet showed `getMySubscriptions` but not `getUserSubscriptions`.
        // However, I added `getFollowing` endpoint.
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

    // Modal Methods
    openFollowersModal() {
        const user = this.profileUser();
        if (!user) return;

        this.userService.getFollowers(user.username).subscribe(users => {
            this.modalTitle.set('Followers');
            // Map to show the SUBSCRIBER (the person following the profile user)
            const mappedUsers = users.map((u: any) => ({
                username: u.subscriberUsername,
                avatarUrl: u.subscriberAvatarUrl,
                // Keep original ID if needed for navigation, though username is used
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
            // Map to show the TARGET (the person the profile user is following)
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
}
