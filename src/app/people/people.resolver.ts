import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Person } from './person.model';
import { PeopleService } from './people.service';

export const peopleResolver: ResolveFn<readonly Person[]> = () => inject(PeopleService).loadPeople();
