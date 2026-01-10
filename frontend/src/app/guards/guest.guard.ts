import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const guestGuard: CanActivateFn = () => {
    const router = inject(Router);

    if (localStorage.getItem('auth_token')) {
        router.navigate(['/home']);
        return false;
    }

    return true;
};
