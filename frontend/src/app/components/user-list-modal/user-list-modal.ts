import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-user-list-modal',
    standalone: true,
    imports: [CommonModule, MatIconModule, RouterModule],
    templateUrl: './user-list-modal.html',
    styleUrl: './user-list-modal.css'
})
export class UserListModal {
    @Input() title: string = '';
    @Input() users: any[] = [];
    @Output() close = new EventEmitter<void>();

    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    onClose() {
        this.close.emit();
    }

    viewUserProfile(username: string) {
        this.onClose();
        if (this.authService.currentUser()?.username === username) {
            this.router.navigate(['/block']);
        } else {
            this.router.navigate(['/block', username]);
        }
    }
}
