import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, combineLatest, finalize, map, of, startWith, tap } from 'rxjs';
import { Person, PersonFields, Film, Species, Vehicle, Planet, PersonDetails, LoadState } from './person.model';

@Injectable({ providedIn: 'root' })
export class PeopleService {
  private readonly http = inject(HttpClient);
  private readonly akababBaseUrl = 'https://akabab.github.io/starwars-api/api';
  private readonly entries = signal<readonly Person[]>([]);
  private readonly loadingPeople = signal(false);
  private readonly peopleLoadFailure = signal<string | null>(null);
  readonly people = this.entries.asReadonly();
  readonly peopleLoading = this.loadingPeople.asReadonly();
  readonly peopleLoadError = this.peopleLoadFailure.asReadonly();

  loadPeople(): Observable<readonly Person[]> {
    this.entries.set([]);
    this.peopleLoadFailure.set(null);
    this.loadingPeople.set(true);

    return this.http.get<PersonFields[]>('https://swapi.info/api/people').pipe(
      map((people) =>
        people.map((person) => {
          const url = person.url || '';
          return {
            ...person,
            id: url.split('/').filter(Boolean).pop()!,
          };
        }),
      ),
      tap((people) => this.entries.set(people)),
      catchError((error: unknown) => {
        console.error('Failed to load people from SWAPI', error);
        this.peopleLoadFailure.set('Could not load People. Please try again.');
        return of([]);
      }),
      finalize(() => this.loadingPeople.set(false)),
    );
  }

  addPerson(fields: PersonFields): Person {
    const now = new Date().toISOString();
    const person: Person = {
      ...fields,
      id: `local-${crypto.randomUUID()}`,
      created: now,
      edited: now,
    };
    this.entries.update((people) => [person, ...people]);
    return person;
  }

  deletePerson(id: string) {
    this.entries.update((people) => people.filter((person) => person.id !== id));
  }

  loadPersonDetails(person: Person): Observable<PersonDetails> {

    return combineLatest({
      films: this.loadRelated<Film>(person.films ?? []),
      homeworld: this.loadRelated<Planet>(person.homeworld ? [person.homeworld] : []).pipe(
        map((state) => ({ ...state, data: state.data[0] ?? null })),
      ),
      species: this.loadRelated<Species>(person.species ?? []),
      vehicles: this.loadRelated<Vehicle>(person.vehicles ?? []),
    });
  }

  private loadRelated<T>(urls: readonly string[]): Observable<LoadState<T[]>> {
    if (!urls.length) return of({ status: 'loaded', data: [] });

    const requests = urls.map((url) =>
      this.http.get<T>(url).pipe(
        map((data) => ({ data, failed: false })),
        catchError(() => of({ data: null, failed: true })),
      ),
    );

    return combineLatest(requests).pipe(
      map((results): LoadState<T[]> => ({
        status: results.some((result) => result.failed) ? 'error' : 'loaded',
        data: results.map((result) => result.data).filter((data): data is T => data !== null),
      })),
      // Seed each section so other sections can emit without waiting for it.
      startWith<LoadState<T[]>>({ status: 'loading', data: [] }),
    );
  }
  loadPersonImage(id: string): Observable<string | null> {
    return this.http
      .get<{ image?: string }>(`${this.akababBaseUrl}/id/${id}.json`)
      .pipe(map((character) => character.image ?? null));
  }
}
