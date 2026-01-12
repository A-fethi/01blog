import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

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
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './report-dialog.html',
  styleUrl: './report-dialog.css'
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
    if (this.selectedReason === 'Other') {
      const trimmed = this.otherReason.trim();
      return trimmed.length > 0 && trimmed.length <= 200;
    }
    return true;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    const finalReason = this.selectedReason === 'Other' ? this.otherReason.trim() : this.selectedReason;
    this.dialogRef.close(finalReason);
  }
}
