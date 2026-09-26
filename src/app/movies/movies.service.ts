import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, combineLatest, finalize, map, of, startWith, tap } from 'rxjs';
import { Film, LoadState, Person, PersonFields, Vehicle } from '../people/person.model';
import { MovieDetails, MovieRecord, MovieVehicle, resourceId } from './movie.model';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly swapiBaseUrl = 'https://swapi.info/api';
  private readonly entries = signal<readonly MovieRecord[]>([]);
  private readonly loadingMovies = signal(false);
  private readonly moviesLoadFailure = signal<string | null>(null);
  readonly movies = this.entries.asReadonly();
  readonly moviesLoading = this.loadingMovies.asReadonly();
  readonly moviesLoadError = this.moviesLoadFailure.asReadonly();

  loadMovies(): Observable<readonly MovieRecord[]> {
    this.entries.set([]);
    this.moviesLoadFailure.set(null);
    this.loadingMovies.set(true);

    return this.http.get<Film[]>(`${this.swapiBaseUrl}/films`).pipe(
      map((films) => films.map((film) => ({ ...film, id: resourceId(film.url) ?? '' }))),
      tap((films) => this.entries.set(films)),
      catchError((error: unknown) => {
        console.error('Failed to load movies from SWAPI', error);
        this.moviesLoadFailure.set('Could not load Movies. Please try again.');
        return of([]);
      }),
      finalize(() => this.loadingMovies.set(false)),
    );
  }

  loadMovieDetails(movie: MovieRecord): Observable<MovieDetails> {
    return combineLatest({
      people: this.loadRelated<Person>(movie.characters ?? [], (url) =>
        this.http.get<PersonFields>(url).pipe(
          map((person) => ({ ...person, id: resourceId(person.url) ?? resourceId(url) ?? '' })),
        ),
      ),
      vehicles: this.loadRelated<MovieVehicle>(movie.vehicles ?? [], (url) =>
        this.http.get<Vehicle>(url).pipe(
          map((vehicle) => ({ ...vehicle, id: resourceId(vehicle.url) ?? resourceId(url) ?? '' })),
        ),
      ),
    });
  }

  private loadRelated<T>(urls: readonly string[], load: (url: string) => Observable<T>): Observable<LoadState<T[]>> {
    if (!urls.length) return of({ status: 'loaded', data: [] });

    const requests = urls.map((url) =>
      load(url).pipe(
        map((data) => ({ data, failed: false })),
        catchError(() => of({ data: null, failed: true })),
      ),
    );

    return combineLatest(requests).pipe(
      map((results): LoadState<T[]> => ({
        status: results.some((result) => result.failed) ? 'error' : 'loaded',
        data: results.map((result) => result.data).filter((data): data is T => data !== null),
      })),
      startWith<LoadState<T[]>>({ status: 'loading', data: [] }),
    );
  }
}
