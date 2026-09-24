import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PeopleService } from './people.service';
import { Person } from './person.model';

const person: Person = {
  id: '1',
  name: 'Luke',
  height: '172',
  mass: '77',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: '/planet/1',
  films: ['/film/1', '/film/2'],
  species: ['/species/1'],
  vehicles: ['/vehicle/1'],
};

describe('Progressive related data', () => {
  let service: PeopleService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PeopleService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('emits each completed section while other sections are still loading', () => {
    const states: unknown[] = [];
    service.loadPersonDetails(person).subscribe((value) => states.push(value));
    const planet = http.expectOne('/planet/1');
    const film1 = http.expectOne('/film/1');
    const film2 = http.expectOne('/film/2');
    const species = http.expectOne('/species/1');
    const vehicle = http.expectOne('/vehicle/1');
    expect(states.at(-1)).toMatchObject({
      homeworld: { status: 'loading' },
      films: { status: 'loading' },
    });
    planet.flush({ name: 'Tatooine' });
    expect(states.at(-1)).toMatchObject({
      homeworld: { status: 'loaded', data: { name: 'Tatooine' } },
      films: { status: 'loading' },
    });
    species.flush({ name: 'Human' });
    expect(states.at(-1)).toMatchObject({
      species: { status: 'loaded', data: [{ name: 'Human' }] },
      vehicles: { status: 'loading' },
    });
    film1.flush({ title: 'A New Hope' });
    film2.flush({ title: 'The Empire Strikes Back' });
    expect(states.at(-1)).toMatchObject({
      films: {
        status: 'loaded',
        data: [{ title: 'A New Hope' }, { title: 'The Empire Strikes Back' }],
      },
      vehicles: { status: 'loading' },
    });
    vehicle.flush({ name: 'Snowspeeder' });
    expect(states.at(-1)).toMatchObject({
      vehicles: { status: 'loaded', data: [{ name: 'Snowspeeder' }] },
    });
  });

  it('ends failed sections with errors and keeps successful responses', () => {
    const states: unknown[] = [];
    service.loadPersonDetails(person).subscribe((value) => states.push(value));
    const planet = http.expectOne('/planet/1');
    const film1 = http.expectOne('/film/1');
    const film2 = http.expectOne('/film/2');
    const species = http.expectOne('/species/1');
    const vehicle = http.expectOne('/vehicle/1');
    planet.flush('failure', { status: 500, statusText: 'Error' });
    expect(states.at(-1)).toMatchObject({
      homeworld: { status: 'error', data: null },
      films: { status: 'loading' },
    });
    film1.flush({ title: 'A New Hope' });
    film2.flush('failure', { status: 500, statusText: 'Error' });
    expect(states.at(-1)).toMatchObject({
      films: { status: 'error', data: [{ title: 'A New Hope' }] },
    });
    species.flush({ name: 'Human' });
    vehicle.flush('failure', { status: 500, statusText: 'Error' });
    expect(states.at(-1)).toMatchObject({
      species: { status: 'loaded' },
      vehicles: { status: 'error', data: [] },
    });
  });

  it('treats missing related URLs as loaded empty sections without HTTP', () => {
    const states: unknown[] = [];
    service
      .loadPersonDetails({ ...person, homeworld: undefined, films: [], species: [], vehicles: [] })
      .subscribe((value) => states.push(value));
    expect(states.at(-1)).toEqual({
      homeworld: { status: 'loaded', data: null },
      films: { status: 'loaded', data: [] },
      species: { status: 'loaded', data: [] },
      vehicles: { status: 'loaded', data: [] },
    });
    http.expectNone(() => true);
  });
});
