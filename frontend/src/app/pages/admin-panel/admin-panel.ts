import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AdminService, UserDTO, AdminStats } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-admin-panel',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './admin-panel.html',
    styleUrl: './admin-panel.css'
})
export class AdminPanelComponent implements OnInit {
    stats: AdminStats = {
        totalUsers: 0,
        regularUsers: 0,
        totalPosts: 0,
        totalReports: 0
    };

    users: UserDTO[] = [];
    filteredUsers: UserDTO[] = [];

    activeTab: 'users' | 'posts' | 'reports' = 'users';
    searchQuery = '';
    isLoading = false;

    constructor(
        private adminService: AdminService,
        private authService: AuthService,
        private router: Router,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        if (!this.authService.IsAdmin()) {
            this.notificationService.error('Access denied. Admin privileges required.');
            this.router.navigate(['/']);
            return;
        }

        this.loadDashboardData();
    }

    loadDashboardData() {
        this.isLoading = true;

        this.adminService.getDashboardStats().subscribe({
            next: (stats) => {
                this.stats = stats;
            },
            error: (err) => {
                console.error('Failed to load stats:', err);
                this.notificationService.error('Failed to load dashboard statistics');
            }
        });

        this.adminService.getAllUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.filteredUsers = users;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load users:', err);
                this.notificationService.error('Failed to load users');
                this.isLoading = false;
            }
        });
    }

    setActiveTab(tab: 'users' | 'posts' | 'reports') {
        this.activeTab = tab;
    }

    onSearch(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.searchQuery = query;

        if (!query) {
            this.filteredUsers = this.users;
            return;
        }

        this.filteredUsers = this.users.filter(user =>
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    }

    deleteUser(userId: number, username: string) {
        if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            return;
        }

        this.adminService.deleteUser(userId).subscribe({
            next: () => {
                this.notificationService.success(`User "${username}" deleted successfully`);
                this.loadDashboardData();
            },
            error: (err) => {
                console.error('Failed to delete user:', err);
                this.notificationService.error(err.error?.error || 'Failed to delete user');
            }
        });
    }

    banUser(userId: number, username: string) {
        if (!confirm(`Are you sure you want to ban user "${username}"?`)) {
            return;
        }

        this.adminService.banUser(userId).subscribe({
            next: () => {
                this.notificationService.success(`User "${username}" banned successfully`);
                this.loadDashboardData();
            },
            error: (err) => {
                console.error('Failed to ban user:', err);
                this.notificationService.error('Failed to ban user');
            }
        });
    }

    goBack() {
        this.router.navigate(['/']);
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}
