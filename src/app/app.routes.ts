import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'start' },
  { path: 'start', loadComponent: () => import('./start/start.component').then(m => m.StartComponent) },
  { path: 'people', loadChildren: () => import('./people/people.routes').then(m => m.PEOPLE_ROUTES) },
  { path: 'vehicles', loadChildren: () => import('./vehicles/vehicles.routes').then(m => m.VEHICLE_ROUTES) },
  { path: 'movies', loadChildren: () => import('./movies/movies.routes').then(m => m.MOVIE_ROUTES) },
];
