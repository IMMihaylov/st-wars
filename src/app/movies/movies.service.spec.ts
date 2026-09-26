import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MoviesService } from './movies.service';
import { Film } from '../people/person.model';

const film: Film = {
  title: 'A New Hope',
  episode_id: 4,
  opening_crawl: 'A long time ago...',
  director: 'George Lucas',
  producer: 'Gary Kurtz',
  release_date: '1977-05-25',
  characters: ['https://swapi.info/api/people/1'],
  planets: [],
  starships: [],
  vehicles: ['https://swapi.info/api/vehicles/14'],
  species: [],
  url: 'https://swapi.info/api/films/1',
};

describe('MoviesService', () => {
  let service: MoviesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MoviesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads films and derives each movie id from its URL', () => {
    service.loadMovies().subscribe();
    http.expectOne('https://swapi.info/api/films').flush([film]);

    expect(service.movies()).toEqual([{ ...film, id: '1' }]);
  });

  it('loads linked people and vehicles with IDs for reciprocal navigation', () => {
    const states: unknown[] = [];
    service.loadMovieDetails({ ...film, id: '1' }).subscribe((state) => states.push(state));

    expect(states[0]).toEqual({
      people: { status: 'loading', data: [] },
      vehicles: { status: 'loading', data: [] },
    });
    http.expectOne('https://swapi.info/api/people/1').flush({
      name: 'Luke Skywalker',
      height: '172',
      mass: '77',
      birth_year: '19BBY',
      gender: 'male',
      url: 'https://swapi.info/api/people/1',
    });
    http.expectOne('https://swapi.info/api/vehicles/14').flush({
      name: 'Snowspeeder',
      model: 't-47 airspeeder',
      manufacturer: 'Incom corporation',
      cost_in_credits: 'unknown',
      length: '4.5',
      max_atmosphering_speed: '1000',
      crew: '2',
      passengers: '0',
      cargo_capacity: '10',
      consumables: 'none',
      vehicle_class: 'airspeeder',
      url: 'https://swapi.info/api/vehicles/14',
    });

    expect(states.at(-1)).toMatchObject({
      people: { status: 'loaded', data: [{ id: '1', name: 'Luke Skywalker' }] },
      vehicles: { status: 'loaded', data: [{ id: '14', name: 'Snowspeeder' }] },
    });
  });
});
