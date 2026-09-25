import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, pattern, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PeopleService } from '../../people.service';
import { PersonFields } from '../../person.model';

type AddPersonFormModel = Pick<PersonFields, 'name' | 'height' | 'mass' | 'birth_year' | 'gender'>;

@Component({
  selector: 'app-add-person-dialog',
  imports: [
    FormField,
    FormRoot,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-person-dialog.component.html',
})
export class AddPersonDialogComponent {
  private readonly service = inject(PeopleService);
  private readonly dialog = inject(MatDialogRef<AddPersonDialogComponent>);
  readonly fields: { key: keyof AddPersonFormModel; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'height', label: 'Height' },
    { key: 'mass', label: 'Mass' },
    { key: 'birth_year', label: 'Birth year' },
    { key: 'gender', label: 'Gender' },
  ];
  readonly formModel = signal<AddPersonFormModel>({
    name: '',
    height: '',
    mass: '',
    birth_year: '',
    gender: '',
  });

  readonly form = form(
    this.formModel,
    (path) => {
      required(path.name);
      pattern(path.name, /\S/);
      required(path.height);
      pattern(path.height, /\S/);
      required(path.mass);
      pattern(path.mass, /\S/);
      required(path.birth_year);
      pattern(path.birth_year, /\S/);
      required(path.gender);
      pattern(path.gender, /\S/);
    },
    {
      submission: {
        action: async (field) => {
          this.dialog.close(this.service.addPerson(field().value()));
        },
      },
    },
  );
}
