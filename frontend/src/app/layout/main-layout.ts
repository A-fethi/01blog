import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.css'
})
export class MainLayout {
    readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly showUserMenu = signal(false);

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
