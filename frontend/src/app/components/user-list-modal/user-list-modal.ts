import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

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

    onClose() {
        this.close.emit();
    }
}
