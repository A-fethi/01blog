import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error instanceof HttpErrorResponse) {
                if (error.status === 404) {
                    router.navigate(['/404']);
                } else if (error.status === 500) {
                    router.navigate(['/500']);
                } else if (error.status === 403) {
                    router.navigate(['/403']);
                } else if (error.status === 401) {
                    if (!router.url.includes('/login')) {
                        router.navigate(['/login']);
                    }
                } else if (error.status === 400) {
                    router.navigate(['/400']);
                }
            }
            return throwError(() => error);
        })
    );
};
