import { Routes } from '@angular/router';
import { MovieDetailsComponent } from './details/movie-details.component';
import { MoviesListComponent } from './list/movies-list.component';
import { moviesResolver } from './movies.resolver';

export const MOVIE_ROUTES: Routes = [
  {
    path: '',
    component: MoviesListComponent,
    resolve: { movies: moviesResolver },
    children: [{ path: ':id', component: MovieDetailsComponent }],
  },
];
