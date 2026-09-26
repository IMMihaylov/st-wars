import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MovieDetailsComponent } from './movie-details.component';
import { MoviesService } from '../movies.service';

describe('Movie details', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let http: HttpTestingController;

  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ id: '1' }));
    TestBed.configureTestingModule({
      imports: [MovieDetailsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: params, snapshot: { paramMap: params.value } } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(MoviesService).loadMovies().subscribe();
    http.expectOne('https://swapi.info/api/films').flush([
      {
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
      },
    ]);
  });

  afterEach(() => http.verify());

  it('links related people and vehicles to their detail routes', async () => {
    const fixture = TestBed.createComponent(MovieDetailsComponent);
    await fixture.whenStable();
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
    await fixture.whenStable();

    const links = [...fixture.nativeElement.querySelectorAll('a[aria-label^="Navigate to"]')];
    expect(links.map((link: HTMLAnchorElement) => link.getAttribute('href'))).toEqual([
      '/people/1',
      '/vehicles/14',
    ]);
    expect(links.map((link: HTMLAnchorElement) => link.getAttribute('aria-label'))).toEqual([
      'Navigate to person: Luke Skywalker',
      'Navigate to vehicle: Snowspeeder',
    ]);
  });
});
