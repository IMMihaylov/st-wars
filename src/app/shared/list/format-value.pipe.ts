import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatValue' })
export class FormatValuePipe implements PipeTransform {
  transform(value: unknown, key: string) {
    if (!value) return '';
    if (Array.isArray(value)) return value.join(', ');

    if (key === 'created' || key === 'edited') {
      try {
        return new Date(value as string | number).toLocaleDateString();
      } catch {
        return String(value);
      }
    }

    return String(value);
  }
}
