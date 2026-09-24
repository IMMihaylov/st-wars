import { Routes } from '@angular/router';
import { StartComponent } from './start/start.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'start' },
  { path: 'start', component: StartComponent },
  { path: 'people', loadChildren: () => import('./people/people.routes').then(m => m.PEOPLE_ROUTES) },
];
