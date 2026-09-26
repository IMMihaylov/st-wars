import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MoviesListComponent } from './movies-list.component';
import { MoviesService } from '../movies.service';

describe('Movies list', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [MoviesListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }),
  );

  it('shows films and filters them by title', async () => {
    const service = TestBed.inject(MoviesService);
    const http = TestBed.inject(HttpTestingController);
    service.loadMovies().subscribe();
    http.expectOne('https://swapi.info/api/films').flush([
      {
        title: 'A New Hope',
        episode_id: 4,
        release_date: '1977-05-25',
        url: 'https://swapi.info/api/films/1',
      },
      {
        title: 'The Empire Strikes Back',
        episode_id: 5,
        release_date: '1980-05-21',
        url: 'https://swapi.info/api/films/2',
      },
    ]);
    const fixture = TestBed.createComponent(MoviesListComponent);
    await fixture.whenStable();

    const rows = () => fixture.nativeElement.querySelectorAll('[data-item-id]');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Movies');
    expect(rows()).toHaveLength(2);
    expect(rows()[0].textContent).toContain('A New Hope');

    const search: HTMLInputElement = fixture.nativeElement.querySelector('input');
    search.value = 'empire';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(rows()).toHaveLength(1);
    expect(rows()[0].textContent).toContain('The Empire Strikes Back');
    http.verify();
  });
});
