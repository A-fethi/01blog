import { Component, signal, computed, effect, inject } from '@angular/core';
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
export class AdminPanel {
    private readonly adminService = inject(AdminService);
    readonly authService = inject(AuthService);  // Changed from private to public
    private readonly router = inject(Router);
    private readonly notificationService = inject(NotificationService);

    readonly stats = signal<AdminStats>({
        totalUsers: 0,
        regularUsers: 0,
        totalPosts: 0,
        totalReports: 0
    });

    readonly users = signal<UserDTO[]>([]);
    readonly activeTab = signal<'users' | 'posts' | 'reports'>('users');
    readonly searchQuery = signal('');
    readonly isLoading = signal(false);

    // Computed: Automatically filters users based on search query
    readonly filteredUsers = computed(() => {
        const query = this.searchQuery().toLowerCase();
        if (!query) return this.users();

        return this.users().filter(user =>
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    });

    constructor() {
        // Wait for auth to finish loading, then check admin status
        effect(() => {
            const isLoading = this.authService.isLoading();
            const isAdmin = this.authService.isAdmin();

            // Only check admin status after loading is complete
            if (!isLoading) {
                if (!isAdmin) {
                    this.notificationService.error('Access denied. Admin privileges required.');
                    this.router.navigate(['/']);
                    return;
                }

                // Load dashboard data only once when auth is ready
                if (this.users().length === 0 && !this.isLoading()) {
                    this.loadDashboardData();
                }
            }
        });
    }

    private loadDashboardData() {
        this.isLoading.set(true);

        this.adminService.getDashboardStats().subscribe({
            next: stats => this.stats.set(stats),
            error: err => {
                this.notificationService.error('Failed to load dashboard statistics');
            }
        });

        this.adminService.getAllUsers().subscribe({
            next: users => {
                this.users.set(users);
                this.isLoading.set(false);
            },
            error: err => {
                this.notificationService.error('Failed to load users');
                this.isLoading.set(false);
            }
        });
    }

    setActiveTab(tab: 'users' | 'posts' | 'reports') {
        this.activeTab.set(tab);
    }

    onSearch(event: Event) {
        const query = (event.target as HTMLInputElement).value;
        this.searchQuery.set(query);
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
            error: err => {
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
            error: err => {
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
