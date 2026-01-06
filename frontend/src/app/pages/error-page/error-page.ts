import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-error-page',
    standalone: true,
    imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
    templateUrl: './error-page.html',
    styleUrl: './error-page.css'
})
export class ErrorPage implements OnInit {
    errorCode: string = '404';
    errorMessage: string = 'Page Not Found';
    errorDescription: string = "The page you're looking for doesn't exist or has been moved.";
    errorIcon: string = 'sentiment_very_dissatisfied';

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.data.subscribe(data => {
            if (data['type'] === '404') {
                this.errorCode = '404';
                this.errorMessage = 'Page Not Found';
                this.errorDescription = "Oops! The page you're looking for doesn't exist or has been moved.";
                this.errorIcon = 'explore_off';
            } else if (data['type'] === '500') {
                this.errorCode = '500';
                this.errorMessage = 'Internal Server Error';
                this.errorDescription = "Something went wrong on our end. We're working on fixing it.";
                this.errorIcon = 'dns';
            } else if (data['type'] === '403') {
                this.errorCode = '403';
                this.errorMessage = 'Access Denied';
                this.errorDescription = "You don't have permission to access this page.";
                this.errorIcon = 'lock';
            } else if (data['type'] === '400') {
                this.errorCode = '400';
                this.errorMessage = 'Bad Request';
                this.errorDescription = "The server could not understand the request.";
                this.errorIcon = 'error_outline';
            }
            // else if (data['type'] === '429') {
            //     this.errorCode = '429';
            //     this.errorMessage = 'Too Many Requests';
            //     this.errorDescription = "Slow down! You're sending too many requests. Please wait a moment before trying again.";
            //     this.errorIcon = 'speed';
            // }
        });

        this.route.queryParams.subscribe(params => {
            if (params['code']) this.errorCode = params['code'];
            if (params['message']) this.errorMessage = params['message'];
        });
    }

    goBack() {
        window.history.back();
    }
}
