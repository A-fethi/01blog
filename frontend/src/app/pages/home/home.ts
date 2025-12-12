import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MatIconModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // Inject dependencies - cleaner than constructor injection
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // Signals for reactive state management
  readonly newPostContent = signal('');
  readonly showComments = signal(false);
  readonly newComment = signal('');
  readonly showUserMenu = signal(false);
  readonly isLiked = signal(false);

  // Computed signal - automatically updates when currentUser changes
  readonly currentUser = computed(() => {
    const user = this.authService.currentUser();
    return user ? {
      name: user.username,
      handle: '@' + user.username
    } : {
      name: 'Guest',
      handle: '@guest'
    };
  });

  readonly comments = signal([
    { author: 'Alice', text: 'Nice post!', time: '2h ago' },
    { author: 'Bob', text: 'Very helpful, thanks.', time: '1h ago' }
  ]);

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

    console.log('Share post:', content);
    this.newPostContent.set('');
  }

  onLike() {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.info('Please log in to like posts');
      return;
    }
    this.isLiked.update(liked => !liked);
  }

  toggleComments() {
    this.showComments.update(show => !show);
  }

  onSubmitComment() {
    if (!this.requireLogin()) return;

    const content = this.newComment().trim();
    if (!content) return;

    console.log('New comment:', content);
    this.newComment.set('');
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
