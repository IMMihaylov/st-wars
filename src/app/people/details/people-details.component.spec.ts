import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PeopleDetailsComponent } from './people-details.component';
import { PeopleService } from '../people.service';

const imageUrl = (id: string) => `https://akabab.github.io/starwars-api/api/id/${id}.json`;

describe('Related details lifecycle', () => {
  const fields = { height: '172', mass: '77', birth_year: '19BBY', gender: 'male' };
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let http: HttpTestingController;
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ id: '1' }));
    TestBed.configureTestingModule({ providers: [
      provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
      { provide: ActivatedRoute, useValue: { paramMap: params, snapshot: { paramMap: params.value } } },
    ] });
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(PeopleService).loadPeople().subscribe();
    http.expectOne('https://swapi.info/api/people').flush([
      { ...fields, name: 'Luke', url: '/people/1', homeworld: '/planet/1', films: ['/film/1'] },
      { ...fields, name: 'Leia', url: '/people/2', homeworld: '/planet/2' },
    ]);
  });
  afterEach(() => http.verify());

  it('cancels old requests on selection change and outstanding requests on destroy', async () => {
    const fixture = TestBed.createComponent(PeopleDetailsComponent);
    await fixture.whenStable();
    const oldImage = http.expectOne(imageUrl('1'));
    const oldPlanet = http.expectOne('/planet/1');
    const oldFilm = http.expectOne('/film/1');
    params.next(convertToParamMap({ id: '2' }));
    await fixture.whenStable();
    const currentImage = http.expectOne(imageUrl('2'));
    const current = http.expectOne('/planet/2');
    expect(oldImage.cancelled).toBe(true);
    expect(oldPlanet.cancelled).toBe(true);
    expect(oldFilm.cancelled).toBe(true);
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Leia');
    fixture.destroy();
    expect(currentImage.cancelled).toBe(true);
    expect(current.cancelled).toBe(true);
  });

  it('shows completed data alongside skeletons and replaces failed skeletons with errors', async () => {
    const fixture = TestBed.createComponent(PeopleDetailsComponent);
    await fixture.whenStable();
    http.expectOne(imageUrl('1')).flush({});
    const planet = http.expectOne('/planet/1');
    const film = http.expectOne('/film/1');
    planet.flush({ name: 'Tatooine' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Tatooine');
    expect(fixture.nativeElement.querySelector('[data-loading]')).not.toBeNull();
    film.flush('failure', { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Could not load some films.');
    expect(fixture.nativeElement.querySelector('[data-loading]')).toBeNull();
  });

  it('clears details and cancels requests when navigating to a local or missing person', async () => {
    const local = TestBed.inject(PeopleService).addPerson({ ...fields, name: 'Local' });
    const fixture = TestBed.createComponent(PeopleDetailsComponent);
    await fixture.whenStable();
    const image = http.expectOne(imageUrl('1'));
    http.expectOne('/planet/1').flush({ name: 'Tatooine' });
    const film = http.expectOne('/film/1');
    params.next(convertToParamMap({ id: local.id }));
    await fixture.whenStable();
    expect(image.cancelled).toBe(true);
    expect(film.cancelled).toBe(true);
    expect(fixture.componentInstance.details()).toBeNull();
    params.next(convertToParamMap({ id: 'missing' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.details()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Person not found');
    http.expectNone(() => true);
  });
});
