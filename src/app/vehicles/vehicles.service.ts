import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, combineLatest, finalize, map, of, startWith, tap } from 'rxjs';
import { Film, LoadState, Person, PersonFields, Vehicle } from '../people/person.model';
import { VehicleDetails, VehicleRecord, resourceId } from './vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehiclesService {
  private readonly http = inject(HttpClient);
  private readonly swapiBaseUrl = 'https://swapi.info/api';
  private readonly entries = signal<readonly VehicleRecord[]>([]);
  private readonly loadingVehicles = signal(false);
  private readonly vehiclesLoadFailure = signal<string | null>(null);
  readonly vehicles = this.entries.asReadonly();
  readonly vehiclesLoading = this.loadingVehicles.asReadonly();
  readonly vehiclesLoadError = this.vehiclesLoadFailure.asReadonly();

  loadVehicles(): Observable<readonly VehicleRecord[]> {
    this.entries.set([]);
    this.vehiclesLoadFailure.set(null);
    this.loadingVehicles.set(true);

    return this.http.get<Vehicle[]>(`${this.swapiBaseUrl}/vehicles`).pipe(
      map((vehicles) => vehicles.map((vehicle) => ({
        ...vehicle,
        id: resourceId(vehicle.url) ?? '',
      }))),
      tap((vehicles) => this.entries.set(vehicles)),
      catchError((error: unknown) => {
        console.error('Failed to load vehicles from SWAPI', error);
        this.vehiclesLoadFailure.set('Could not load Vehicles. Please try again.');
        return of([]);
      }),
      finalize(() => this.loadingVehicles.set(false)),
    );
  }

  loadVehicleDetails(vehicle: VehicleRecord): Observable<VehicleDetails> {
    return combineLatest({
      pilots: this.loadRelated<Person>(vehicle.pilots ?? [], (url) =>
        this.http.get<PersonFields>(url).pipe(
          map((person) => ({ ...person, id: resourceId(person.url) ?? resourceId(url) ?? '' })),
        ),
      ),
      films: this.loadRelated<Film>(vehicle.films ?? [], (url) => this.http.get<Film>(url)),
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
