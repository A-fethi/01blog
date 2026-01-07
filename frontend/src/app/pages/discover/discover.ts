import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { AuthService, UserDTO } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-discover',
    standalone: true,
    imports: [CommonModule, MatIconModule, RouterModule],
    templateUrl: './discover.html',
    styleUrl: './discover.css'
})
export class Discover implements OnInit {
    readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);
    private readonly notificationService = inject(NotificationService);
    private readonly router = inject(Router);

    readonly suggestedUsers = signal<UserDTO[]>([]);
    readonly followingUsers = signal<any[]>([]);
    readonly followersUsers = signal<any[]>([]);
    readonly followedUserIds = signal<Set<number>>(new Set());
    private followingUserIdsInProgress = new Set<number>();

    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.loadData();
        } else {
            this.router.navigate(['/login']);
        }
    }

    loadData() {
        const username = this.authService.currentUser()?.username;
        if (!username) return;

        this.userService.getMySubscriptions().subscribe(subs => {
            const followedIds = new Set(subs.map((s: any) => s.targetId));
            this.followedUserIds.set(followedIds);

            const following = subs.map((s: any) => ({
                id: s.targetId,
                username: s.targetUsername,
                avatarUrl: s.targetAvatarUrl
            }));
            this.followingUsers.set(following);

            this.userService.getFollowers(username).subscribe(followers => {
                const mappedFollowers = followers.map((f: any) => ({
                    id: f.subscriberId,
                    username: f.subscriberUsername,
                    avatarUrl: f.subscriberAvatarUrl
                }));
                this.followersUsers.set(mappedFollowers);
            });

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

    onFollowUser(user: any) {
        if (this.followingUserIdsInProgress.has(user.id)) return;
        this.followingUserIdsInProgress.add(user.id);

        const isFollowing = this.followedUserIds().has(user.id);

        if (isFollowing) {
            this.userService.unfollowUser(user.id).subscribe({
                next: () => {
                    this.followedUserIds.update(ids => {
                        const newIds = new Set(ids);
                        newIds.delete(user.id);
                        return newIds;
                    });
                    this.followingUsers.update(users => users.filter(u => u.id !== user.id));
                    this.loadData();
                    this.notificationService.success(`Unfollowed ${user.username}`);
                    this.followingUserIdsInProgress.delete(user.id);
                },
                error: () => this.followingUserIdsInProgress.delete(user.id)
            });
        } else {
            this.userService.followUser(user.id).subscribe({
                next: () => {
                    this.followedUserIds.update(ids => {
                        const newIds = new Set(ids);
                        newIds.add(user.id);
                        return newIds;
                    });
                    this.followingUsers.update(users => [...users, {
                        id: user.id,
                        username: user.username,
                        avatarUrl: user.avatarUrl
                    }]);
                    this.suggestedUsers.update(users => users.filter(u => u.id !== user.id));
                    this.notificationService.success(`Following ${user.username}`);
                    this.followingUserIdsInProgress.delete(user.id);
                },
                error: () => this.followingUserIdsInProgress.delete(user.id)
            });
        }
    }

    viewUserProfile(username: string) {
        this.router.navigate(['/block', username]);
    }
}
