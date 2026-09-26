import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DetailsFieldsComponent, DetailField } from '../../shared/details-fields/details-fields.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { MovieDetails, MovieRecord, resourceId } from '../movie.model';
import { MoviesService } from '../movies.service';

@Component({
  selector: 'app-movie-details',
  imports: [MatButtonModule, MatTooltipModule, RouterLink, DetailsFieldsComponent, SkeletonComponent],
  templateUrl: './movie-details.component.html',
})
export class MovieDetailsComponent {
  readonly movieFields: readonly DetailField<MovieRecord>[] = [
    { key: 'episode_id', label: 'Episode' },
    { key: 'director', label: 'Director' },
    { key: 'producer', label: 'Producer' },
    { key: 'release_date', label: 'Release date' },
  ];
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly moviesService = inject(MoviesService);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly movie = computed(() =>
    this.moviesService.movies().find((movie) => movie.id === this.params().get('id')),
  );
  readonly details = signal<MovieDetails | null>(null);
  readonly peopleLinks = computed(() => {
    const movie = this.movie();
    if (!movie) return [];

    const loadedPeople = this.details()?.people.data ?? [];
    return (movie.characters ?? []).flatMap((url) => {
      const id = resourceId(url);
      if (!id) return [];
      const person = loadedPeople.find((item) => item.id === id);
      return [{ id, label: person?.name ?? `Person ${id}` }];
    });
  });
  readonly vehicleLinks = computed(() => {
    const movie = this.movie();
    if (!movie) return [];

    const loadedVehicles = this.details()?.vehicles.data ?? [];
    return (movie.vehicles ?? []).flatMap((url) => {
      const id = resourceId(url);
      if (!id) return [];
      const vehicle = loadedVehicles.find((item) => item.id === id);
      return [{ id, label: vehicle?.name ?? `Vehicle ${id}` }];
    });
  });

  constructor() {
    effect((onCleanup) => {
      const movie = this.movie();
      this.details.set(null);
      if (!movie) return;

      const subscription = this.moviesService.loadMovieDetails(movie).subscribe({
        next: (data) => this.details.set(data),
        error: (error) => console.error('Error loading movie details:', error),
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  close() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
