import { Film, LoadState, Person, Vehicle } from '../people/person.model';

export interface MovieRecord extends Film {
  id: string;
}

export interface MovieVehicle extends Vehicle {
  id: string;
}

export interface MovieDetails {
  people: LoadState<Person[]>;
  vehicles: LoadState<MovieVehicle[]>;
}

export const MOVIE_LIST_DISPLAY_FIELDS: { key: keyof MovieRecord; label: string }[] = [
  { key: 'title', label: 'Title' },
  { key: 'episode_id', label: 'Episode' },
  { key: 'release_date', label: 'Released' },
];

export function resourceId(url: string | undefined): string | null {
  return url?.split('/').filter(Boolean).pop() ?? null;
}
