import { Film, LoadState, Person, Vehicle } from '../people/person.model';

export interface VehicleRecord extends Vehicle {
  id: string;
}

export interface VehicleDetails {
  pilots: LoadState<Person[]>;
  films: LoadState<Film[]>;
}

export const VEHICLE_LIST_DISPLAY_FIELDS: { key: keyof VehicleRecord; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'created', label: 'Created' },
  { key: 'edited', label: 'Modified' },
];

export function resourceId(url: string | undefined): string | null {
  return url?.split('/').filter(Boolean).pop() ?? null;
}
