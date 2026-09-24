import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';

export interface DetailField<T> {
  key: Extract<keyof T, string>;
  label: string;
}

@Component({
  selector: 'app-details-fields',
  imports: [MatListModule],
  templateUrl: './details-fields.component.html',
  styleUrl: './details-fields.component.scss',
  host: { class: 'block' },
})
export class DetailsFieldsComponent<T extends object> {
  readonly data = input.required<T>();
  readonly fields = input.required<readonly DetailField<T>[]>();
  readonly label = input('Details');

  value(field: DetailField<T>): string {
    const value = this.data()[field.key];
    return value == null || value === '' ? '—' : String(value);
  }
}
