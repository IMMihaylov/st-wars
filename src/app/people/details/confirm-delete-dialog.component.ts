import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Confirmation</h2>
    <mat-dialog-content>
      Are you sure you want to delete <span class="font-semibold">{{ data.personName }}</span
      >?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialog.close(false)">Cancel</button>
      <button mat-raised-button color="warn" (click)="dialog.close(true)">Delete</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDeleteDialogComponent {
  readonly dialog = inject(MatDialogRef<ConfirmDeleteDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA);
}
