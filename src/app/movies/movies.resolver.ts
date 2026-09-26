import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { MovieRecord } from './movie.model';
import { MoviesService } from './movies.service';

export const moviesResolver: ResolveFn<readonly MovieRecord[]> = () =>
  inject(MoviesService).loadMovies();
