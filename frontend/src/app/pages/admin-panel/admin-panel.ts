import { Component, signal, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule, ActivatedRoute, Params } from '@angular/router';
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
export class AdminPanel implements OnInit {
    private readonly adminService = inject(AdminService);
    readonly authService = inject(AuthService);  // Changed from private to public
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
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
    readonly selectedPost = signal<any | null>(null);
    readonly showPostModal = signal(false);

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

    ngOnInit() {
        this.route.queryParams.subscribe((params: Params) => {
            const tab = params['tab'];
            if (tab === 'reports' || tab === 'users' || tab === 'posts') {
                this.activeTab.set(tab);
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
            error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to load posts')
        });

        this.adminService.getReports().subscribe({
            next: reports => this.reports.set(reports),
            error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to load reports')
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
                    this.notificationService.error(err.error?.message || err.error?.error || 'Failed to delete user');
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
                    this.notificationService.error(err.error?.message || err.error?.error || 'Failed to ban user');
                }
            });
        };
        this.confirmModalTitle.set('Ban User');
        this.confirmModalMessage.set(`Are you sure you want to ban user "${username}"?`);
        this.showConfirmModal.set(true);
    }

    unbanUser(userId: number, username: string) {
        this.confirmAction = () => {
            this.adminService.unbanUser(userId).subscribe({
                next: () => {
                    this.notificationService.success(`User "${username}" unbanned successfully`);
                    this.loadDashboardData();
                },
                error: err => {
                    this.notificationService.error(err.error?.message || err.error?.error || 'Failed to unban user');
                }
            });
        };
        this.confirmModalTitle.set('Unban User');
        this.confirmModalMessage.set(`Are you sure you want to unban user "${username}"?`);
        this.showConfirmModal.set(true);
    }

    deletePost(postId: number) {
        this.confirmAction = () => {
            this.adminService.deletePost(postId).subscribe({
                next: () => {
                    this.notificationService.success('Post removed successfully');
                    this.loadDashboardData();
                },
                error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to remove post')
            });
        };
        this.confirmModalTitle.set('Remove Post');
        this.confirmModalMessage.set('Are you sure you want to remove this post?');
        this.showConfirmModal.set(true);
    }

    hidePost(postId: number) {
        this.confirmAction = () => {
            this.adminService.hidePost(postId).subscribe({
                next: () => {
                    this.notificationService.success('Post hidden successfully');
                    this.loadDashboardData();
                },
                error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to hide post')
            });
        };
        this.confirmModalTitle.set('Hide Post');
        this.confirmModalMessage.set('Are you sure you want to hide this post? It will no longer be visible to regular users.');
        this.showConfirmModal.set(true);
    }

    unhidePost(postId: number) {
        this.confirmAction = () => {
            this.adminService.unhidePost(postId).subscribe({
                next: () => {
                    this.notificationService.success('Post is now visible');
                    this.loadDashboardData();
                },
                error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to unhide post')
            });
        };
        this.confirmModalTitle.set('Unhide Post');
        this.confirmModalMessage.set('Are you sure you want to make this post visible again?');
        this.showConfirmModal.set(true);
    }

    resolveReport(reportId: number) {
        this.adminService.updateReportStatus(reportId, 'RESOLVED').subscribe({
            next: () => {
                this.notificationService.success('Report marked as resolved');
                this.loadDashboardData();
            },
            error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to update report status')
        });
    }

    rejectReport(reportId: number) {
        this.adminService.updateReportStatus(reportId, 'REJECTED').subscribe({
            next: () => {
                this.notificationService.success('Report rejected');
                this.loadDashboardData();
            },
            error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to update report status')
        });
    }

    navigateToReported(report: any) {
        if (report.reportedPostId) {
            this.viewPost(report.reportedPostId);
        } else if (report.reportedUsername) {
            this.router.navigate(['/block', report.reportedUsername]);
        }
    }

    viewPost(postId: number) {
        const post = this.posts().find(p => p.id === postId);
        if (post) {
            this.selectedPost.set(post);
            this.showPostModal.set(true);
        } else {
            // If post not in current list, we might need to fetch it
            // For now, let's try to find it in the reports if it's there
            this.notificationService.info('Loading post details...');
            // In a real app, you'd call adminService.getPostById(postId)
            // Since we don't have it, we'll just show what we have or an error
            this.notificationService.error('Post details not found in current list');
        }
    }

    closePostModal() {
        this.showPostModal.set(false);
        this.selectedPost.set(null);
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
