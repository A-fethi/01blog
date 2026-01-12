import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PostService, PostDTO } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { CommentService } from '../../services/comment.service';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule, ConfirmModal],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css',
})
export class Subscriptions implements OnInit {
  readonly authService = inject(AuthService);
  private readonly postService = inject(PostService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly commentService = inject(CommentService);
  private readonly adminService = inject(AdminService);

  onHidePost(postId: number) {
    this.confirmAction = () => {
      this.adminService.hidePost(postId).subscribe({
        next: () => {
          this.notificationService.success('Post hidden');
          this.posts.update(posts => posts.filter(p => p.id !== postId));
        },
        error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to hide post')
      });
    };
    this.confirmModalTitle.set('Hide Post');
    this.confirmModalMessage.set('Are you sure you want to hide this post? It will no longer be visible to regular users.');
    this.showConfirmModal.set(true);
  }

  onUnhidePost(postId: number) {
    this.confirmAction = () => {
      this.adminService.unhidePost(postId).subscribe({
        next: () => {
          this.notificationService.success('Post is now visible');
          this.loadFollowedPosts();
        },
        error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to unhide post')
      });
    };
    this.confirmModalTitle.set('Unhide Post');
    this.confirmModalMessage.set('Are you sure you want to make this post visible again?');
    this.showConfirmModal.set(true);
  }

  readonly posts = signal<PostDTO[]>([]);
  readonly loading = signal(false);
  readonly showComments = signal<Set<number>>(new Set());
  readonly commentInputs = signal<Map<number, string>>(new Map());

  // Editing states
  readonly editingPostId = signal<number | null>(null);
  readonly editPostTitle = signal('');
  readonly editPostContent = signal('');
  readonly editPostFiles = signal<File[]>([]);
  readonly editPostFilesPreview = signal<{ url: string, type: string }[]>([]);
  readonly existingMediaUrls = signal<string[]>([]);

  readonly editingCommentId = signal<number | null>(null);
  readonly editCommentContent = signal('');

  // Confirmation Modal State
  readonly showConfirmModal = signal(false);
  readonly confirmModalTitle = signal('');
  readonly confirmModalMessage = signal('');
  private confirmAction: (() => void) | null = null;

  ngOnInit() {
    this.loadFollowedPosts();
  }

  loadFollowedPosts() {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.loading.set(true);

    this.userService.getMySubscriptions().subscribe({
      next: (subs) => {
        const followedIds = new Set(subs.map((s: any) => s.targetId));

        this.postService.getAllPosts().subscribe({
          next: (allPosts) => {
            const filteredPosts = allPosts.filter(post => followedIds.has(post.authorId));
            this.posts.set(filteredPosts);
            this.loading.set(false);
          },
          error: (err) => {
            this.notificationService.error(err.error?.message || err.error?.error || 'Failed to load posts');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || err.error?.error || 'Failed to load subscriptions');
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const validFiles = newFiles.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));

      if (validFiles.length < newFiles.length) {
        this.notificationService.error('Some files were skipped. Only images and videos are allowed.');
      }

      if (validFiles.length === 0) return;

      this.editPostFiles.update(current => [...current, ...validFiles]);
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.editPostFilesPreview.update(previews => [...previews, { url: reader.result as string, type: file.type }]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeEditFile(index: number) {
    this.editPostFiles.update(files => files.filter((_, i) => i !== index));
    this.editPostFilesPreview.update(previews => previews.filter((_, i) => i !== index));
  }

  removeExistingMedia(index: number) {
    this.existingMediaUrls.update(urls => urls.filter((_, i) => i !== index));
  }

  onLike(post: any) {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.info('Please log in to like posts');
      return;
    }

    if (post.isLiked) {
      this.postService.unlikePost(post.id).subscribe({
        next: () => {
          post.isLiked = false;
          post.likesCount = (post.likesCount || 0) - 1;
          this.posts.update(p => [...p]);
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || err.error?.error || 'Failed to unlike post');
        }
      });
    } else {
      this.postService.likePost(post.id).subscribe({
        next: () => {
          post.isLiked = true;
          post.likesCount = (post.likesCount || 0) + 1;
          this.posts.update(p => [...p]);
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || err.error?.error || 'Failed to like post');
        }
      });
    }
  }

  onEditPost(post: any) {
    this.editingPostId.set(post.id);
    this.editPostTitle.set(post.title || '');
    this.editPostContent.set(post.content || '');
    this.editPostFiles.set([]);
    this.editPostFilesPreview.set([]);
    this.existingMediaUrls.set(post.media ? post.media.map((m: any) => m.mediaUrl) : []);
  }

  onCancelEditPost() {
    this.editingPostId.set(null);
  }

  onUpdatePost() {
    const postId = this.editingPostId();
    if (!postId) return;
    const title = this.editPostTitle().trim();
    const content = this.editPostContent().trim();

    if (!title || !content) {
      this.notificationService.error('Title and content are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    this.existingMediaUrls().forEach(url => {
      formData.append('existingMediaUrls', url);
    });

    this.editPostFiles().forEach(file => {
      formData.append('files', file);
    });

    this.postService.updatePost(postId, formData).subscribe({
      next: (updatedPost) => {
        this.posts.update(posts => posts.map(p => p.id === postId ? { ...p, ...updatedPost } : p));
        this.editingPostId.set(null);
        this.notificationService.success('Post updated!');
      },
      error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to update post')
    });
  }

  onDeletePost(postId: number) {
    this.confirmAction = () => {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.posts.update(posts => posts.filter(p => p.id !== postId));
          this.notificationService.success('Post deleted!');
        },
        error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to delete post')
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
    const post = this.posts().find(p => p.id === postId);
    if (post && !post.comments) {
      this.commentService.getCommentsByPost(postId).subscribe(comments => {
        post.comments = comments;
        this.posts.update(p => [...p]);
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
    if (!this.authService.isLoggedIn()) return;

    const content = this.getCommentInput(postId);
    if (!content.trim()) {
      this.notificationService.error('Comment content cannot be empty');
      return;
    }

    this.commentService.addComment(postId, content).subscribe({
      next: (comment) => {
        const post = this.posts().find(p => p.id === postId);
        if (post) {
          if (!post.comments) post.comments = [];
          post.comments.push(comment);
          post.commentsCount = (post.commentsCount || 0) + 1;
          this.setCommentInput(postId, '');
          this.posts.update(p => [...p]);
          this.notificationService.success('Comment added!');
        }
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || err.error?.error || 'Failed to add comment');
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
    const content = this.editCommentContent().trim();
    if (!content) {
      this.notificationService.error('Comment content cannot be empty');
      return;
    }
    this.commentService.updateComment(commentId, content).subscribe({
      next: (updatedComment) => {
        const post = this.posts().find(p => p.id === postId);
        if (post && post.comments) {
          post.comments = post.comments.map((c: any) => c.id === commentId ? updatedComment : c);
        }
        this.editingCommentId.set(null);
        this.posts.update(p => [...p]);
        this.notificationService.success('Comment updated!');
      },
      error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to update comment')
    });
  }

  onDeleteComment(postId: number, commentId: number) {
    this.confirmAction = () => {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          const post = this.posts().find(p => p.id === postId);
          if (post && post.comments) {
            post.comments = post.comments.filter((c: any) => c.id !== commentId);
            post.commentsCount = (post.commentsCount || 0) - 1;
          }
          this.posts.update(p => [...p]);
          this.notificationService.success('Comment deleted!');
        },
        error: (err) => this.notificationService.error(err.error?.message || err.error?.error || 'Failed to delete comment')
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
