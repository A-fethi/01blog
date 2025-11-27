import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  newPostContent = '';
  showComments = false;
  newComment = '';
  showUserMenu = false;
  isLiked = false;

  comments = [
    { author: 'Alice', text: 'Nice post!', time: '2h ago' },
    { author: 'Bob', text: 'Very helpful, thanks.', time: '1h ago' }
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  private requireLogin(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  onSharePost() {
    if (!this.requireLogin()) return;

    const content = this.newPostContent.trim();
    if (!content) return;

    console.log('Share post:', content);
    this.newPostContent = '';
  }

  onLike() {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.info('Please log in to like posts');
      return;
    }
    this.isLiked = !this.isLiked;
    console.log('Like clicked, liked =', this.isLiked);
  }

  onComment() {
    this.showComments = !this.showComments;
  }

  onSubmitComment() {
    if (!this.requireLogin()) return;

    const content = this.newComment.trim();
    if (!content) return;

    console.log('New comment:', content);
    this.newComment = '';
  }

  onProfileClick() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showUserMenu = !this.showUserMenu;
  }

  onLogout() {
    this.authService.logout();
    this.showUserMenu = false;
    // Don't redirect - keep user on home page
  }
}
