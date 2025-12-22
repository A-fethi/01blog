import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AdminService, UserDTO, AdminStats } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';

@Component({
    selector: 'app-admin-panel',
    standalone: true,
    imports: [CommonModule, MatIconModule, RouterModule, ConfirmModal],
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
    readonly posts = signal<any[]>([]);
    readonly reports = signal<any[]>([]);
    readonly activeTab = signal<'users' | 'posts' | 'reports'>('users');
    readonly searchQuery = signal('');
    readonly isLoading = signal(false);

    // Confirmation Modal State
    readonly showConfirmModal = signal(false);
    readonly confirmModalTitle = signal('');
    readonly confirmModalMessage = signal('');
    private confirmAction: (() => void) | null = null;

    // Computed: Automatically filters users based on search query
    readonly filteredUsers = computed(() => {
        const query = this.searchQuery().toLowerCase();
        if (!query) return this.users();

        return this.users().filter(user =>
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    });

    readonly filteredPosts = computed(() => {
        const query = this.searchQuery().toLowerCase();
        if (!query) return this.posts();

        return this.posts().filter(post =>
            (post.title && post.title.toLowerCase().includes(query)) ||
            (post.content && post.content.toLowerCase().includes(query)) ||
            (post.authorUsername && post.authorUsername.toLowerCase().includes(query))
        );
    });

    readonly filteredReports = computed(() => {
        const query = this.searchQuery().toLowerCase();
        if (!query) return this.reports();

        return this.reports().filter(report =>
            (report.reason && report.reason.toLowerCase().includes(query)) ||
            (report.reportedUsername && report.reportedUsername.toLowerCase().includes(query)) ||
            (report.status && report.status.toLowerCase().includes(query))
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

        this.adminService.getAllPosts().subscribe({
            next: posts => this.posts.set(posts),
            error: () => this.notificationService.error('Failed to load posts')
        });

        this.adminService.getReports().subscribe({
            next: reports => this.reports.set(reports),
            error: () => this.notificationService.error('Failed to load reports')
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
        this.confirmAction = () => {
            this.adminService.deleteUser(userId).subscribe({
                next: () => {
                    this.notificationService.success(`User "${username}" deleted successfully`);
                    this.loadDashboardData();
                },
                error: err => {
                    this.notificationService.error(err.error?.error || 'Failed to delete user');
                }
            });
        };
        this.confirmModalTitle.set('Delete User');
        this.confirmModalMessage.set(`Are you sure you want to delete user "${username}"? This action cannot be undone.`);
        this.showConfirmModal.set(true);
    }

    banUser(userId: number, username: string) {
        this.confirmAction = () => {
            this.adminService.banUser(userId).subscribe({
                next: () => {
                    this.notificationService.success(`User "${username}" banned successfully`);
                    this.loadDashboardData();
                },
                error: err => {
                    this.notificationService.error('Failed to ban user');
                }
            });
        };
        this.confirmModalTitle.set('Ban User');
        this.confirmModalMessage.set(`Are you sure you want to ban user "${username}"?`);
        this.showConfirmModal.set(true);
    }

    deletePost(postId: number) {
        this.confirmAction = () => {
            this.adminService.deletePost(postId).subscribe({
                next: () => {
                    this.notificationService.success('Post removed successfully');
                    this.loadDashboardData();
                },
                error: () => this.notificationService.error('Failed to remove post')
            });
        };
        this.confirmModalTitle.set('Remove Post');
        this.confirmModalMessage.set('Are you sure you want to remove this post?');
        this.showConfirmModal.set(true);
    }

    resolveReport(reportId: number) {
        this.adminService.updateReportStatus(reportId, 'RESOLVED').subscribe({
            next: () => {
                this.notificationService.success('Report marked as resolved');
                this.loadDashboardData();
            },
            error: () => this.notificationService.error('Failed to update report status')
        });
    }

    rejectReport(reportId: number) {
        this.adminService.updateReportStatus(reportId, 'REJECTED').subscribe({
            next: () => {
                this.notificationService.success('Report rejected');
                this.loadDashboardData();
            },
            error: () => this.notificationService.error('Failed to update report status')
        });
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
