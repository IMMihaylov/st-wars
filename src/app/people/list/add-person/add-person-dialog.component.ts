import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PeopleService } from '../../people.service';
import { PersonFields } from '../../person.model';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-add-person-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    JsonPipe
  ],
  templateUrl: './add-person-dialog.component.html',
})
export class AddPersonDialogComponent {
  private readonly service = inject(PeopleService);
  private readonly dialog = inject(MatDialogRef<AddPersonDialogComponent>);
  private readonly fb = inject(FormBuilder);
  readonly fields: { key: keyof PersonFields; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'height', label: 'Height' },
    { key: 'mass', label: 'Mass' },
    { key: 'birth_year', label: 'Birth year' },
    { key: 'gender', label: 'Gender' },
  ];
  private readonly required = [Validators.required, Validators.pattern(/\S/)];
      // private readonly number = [Validators.required, Validators.pattern(/^\d+$/)];
      // private readonly date = [Validators.required, Validators.pattern(/^\d{4}$/)];
  readonly form = this.fb.group({
    name: ['', this.required],
    height: ['', this.required],
    mass: ['', this.required],
    birth_year: ['', this.required],
    gender: ['', this.required],
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();
    this.dialog.close(this.service.addPerson(values as any));
  }
}
