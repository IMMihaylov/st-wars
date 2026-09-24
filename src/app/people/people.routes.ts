import { Routes } from '@angular/router';
import { PeopleListComponent } from './list/people-list.component';
import { peopleResolver } from './people.resolver';
import { PeopleDetailsComponent } from './details/people-details.component';

export const PEOPLE_ROUTES: Routes = [
  {
    path: '', component: PeopleListComponent, resolve: { people: peopleResolver },
    children: [{ path: ':id', component: PeopleDetailsComponent }],
  },
];
