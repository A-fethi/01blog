import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './confirm-modal.html',
    styleUrl: './confirm-modal.css'
})
export class ConfirmModal {
    title = input<string>('Confirm Action');
    message = input<string>('Are you sure you want to proceed?');
    confirmText = input<string>('Confirm');
    cancelText = input<string>('Cancel');
    isDanger = input<boolean>(true);

    confirm = output<void>();
    cancel = output<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
