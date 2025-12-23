import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

export interface ReportDialogData {
    type: 'user' | 'post';
    targetName: string;
}

@Component({
    selector: 'app-report-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule
    ],
    template: `
    <div class="report-dialog">
      <h2 mat-dialog-title>Report {{ data.type === 'user' ? 'Profile' : 'Post' }}</h2>
      <mat-dialog-content>
        <p>Why are you reporting this {{ data.type === 'user' ? 'profile' : 'post' }} ({{ data.targetName }})?</p>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reason</mat-label>
          <mat-select [(ngModel)]="selectedReason">
            <mat-option *ngFor="let reason of reasons" [value]="reason">
              {{ reason }}
            </mat-option>
            <mat-option value="Other">Other</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width" *ngIf="selectedReason === 'Other'">
          <mat-label>Please specify</mat-label>
          <textarea matInput [(ngModel)]="otherReason" rows="3"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="warn" [disabled]="!isValid()" (click)="onConfirm()">
          Submit Report
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .report-dialog {
      min-width: 350px;
      padding: 8px;
    }
    .full-width {
      width: 100%;
      margin-top: 16px;
    }
    mat-dialog-content {
        padding-top: 8px;
    }
  `]
})
export class ReportDialog {
    private dialogRef = inject(MatDialogRef<ReportDialog>);
    data: ReportDialogData = inject(MAT_DIALOG_DATA);

    reasons = [
        'Spam',
        'Harassment',
        'Hate Speech',
        'Inappropriate Content',
        'Misinformation',
        'Violence'
    ];

    selectedReason = '';
    otherReason = '';

    isValid(): boolean {
        if (!this.selectedReason) return false;
        if (this.selectedReason === 'Other' && !this.otherReason.trim()) return false;
        return true;
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onConfirm(): void {
        const finalReason = this.selectedReason === 'Other' ? this.otherReason : this.selectedReason;
        this.dialogRef.close(finalReason);
    }
}
