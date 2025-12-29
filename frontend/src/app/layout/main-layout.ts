import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, UserDTO } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { InAppNotificationService } from '../services/in-app-notification.service';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit {
    readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);
    private readonly notificationService = inject(NotificationService);
    readonly inAppNotificationService = inject(InAppNotificationService);
    private readonly router = inject(Router);

    readonly showUserMenu = signal(false);
    readonly suggestedUsers = signal<UserDTO[]>([]);
    readonly followingUsers = signal<any[]>([]);
    readonly followedUserIds = signal<Set<number>>(new Set());

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

    constructor() {
        // Use effect to reload suggestions when user logs in
        effect(() => {
            if (this.authService.isLoggedIn()) {
                this.loadData();
            } else {
                this.suggestedUsers.set([]);
                this.followingUsers.set([]);
            }
        });
    }

    ngOnInit() {
        // Initial load if already logged in (handled by effect usually, but good to have)
    }

    loadData() {
        if (!this.authService.isLoggedIn()) return;

        this.inAppNotificationService.refreshUnreadCount();

        // Load Subscriptions (Following)
        this.userService.getMySubscriptions().subscribe(subs => {
            const followedIds = new Set(subs.map((s: any) => s.targetId));
            this.followedUserIds.set(followedIds);

            // Map subscriptions to user-like objects for display
            const following = subs.map((s: any) => ({
                id: s.targetId,
                username: s.targetUsername,
                avatarUrl: s.targetAvatarUrl
            }));
            this.followingUsers.set(following);

            // Load Suggestions
            this.userService.getAllUsers().subscribe({
                next: (users) => {
                    const currentUserId = this.authService.currentUser()?.id;
                    const suggested = users
                        .filter(u => u.id !== currentUserId && !followedIds.has(u.id));
                    this.suggestedUsers.set(suggested);
                }
            });
        });
    }

    onFollowSuggestedUser(user: UserDTO) {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }

        const isFollowing = this.followedUserIds().has(user.id);

        if (isFollowing) {
            this.userService.unfollowUser(user.id).subscribe({
                next: () => {
                    this.followedUserIds.update(ids => {
                        const newIds = new Set(ids);
                        newIds.delete(user.id);
                        return newIds;
                    });
                    // Remove from following list
                    this.followingUsers.update(users => users.filter(u => u.id !== user.id));
                    // Add back to suggestions if needed, or just reload
                    this.loadData();
                    this.notificationService.success(`Unfollowed ${user.username}`);
                }
            });
        } else {
            this.userService.followUser(user.id).subscribe({
                next: () => {
                    this.followedUserIds.update(ids => {
                        const newIds = new Set(ids);
                        newIds.add(user.id);
                        return newIds;
                    });
                    // Add to following list
                    this.followingUsers.update(users => [...users, {
                        id: user.id,
                        username: user.username,
                        avatarUrl: user.avatarUrl
                    }]);
                    // Remove from suggestions
                    this.suggestedUsers.update(users => users.filter(u => u.id !== user.id));
                    this.notificationService.success(`Following ${user.username}`);
                }
            });
        }
    }

    isUserFollowed(userId: number): boolean {
        return this.followedUserIds().has(userId);
    }

    viewUserProfile(username: string) {
        this.router.navigate(['/block', username]);
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
