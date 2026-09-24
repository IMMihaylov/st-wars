import { FormatValuePipe } from './format-value.pipe';

describe('FormatValuePipe', () => {
  const pipe = new FormatValuePipe();

  it('preserves empty values, text, numbers, and joined arrays', () => {
    expect(pipe.transform(undefined, 'name')).toBe('');
    expect(pipe.transform(null, 'name')).toBe('');
    expect(pipe.transform('', 'name')).toBe('');
    expect(pipe.transform(0, 'height')).toBe('');
    expect(pipe.transform(false, 'value')).toBe('');
    expect(pipe.transform('Luke', 'name')).toBe('Luke');
    expect(pipe.transform(172, 'height')).toBe('172');
    expect(pipe.transform(['Luke', 'Leia'], 'names')).toBe('Luke, Leia');
  });

  it('uses the local date format only for created and edited columns', () => {
    const value = '2024-05-14T12:00:00Z';
    const expected = new Intl.DateTimeFormat().format(new Date(value));
    expect(pipe.transform(value, 'created')).toBe(expected);
    expect(pipe.transform(value, 'edited')).toBe(expected);
    expect(pipe.transform(value, 'name')).toBe(value);
    expect(pipe.transform('not a date', 'created')).toBe('Invalid Date');
  });
});
