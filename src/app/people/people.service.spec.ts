import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PeopleService } from './people.service';

const fields = { name: 'Luke Skywalker', height: '172', mass: '77', birth_year: '19BBY', gender: 'male' };
const apiPerson = { ...fields, url: 'https://swapi.info/api/people/1' };
const endpoint = 'https://swapi.info/api/people';

describe('PeopleService', () => {
  let service: PeopleService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PeopleService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('fetches and maps a fresh collection for every load request', () => {
    service.loadPeople().subscribe();
    http.expectOne(endpoint).flush([apiPerson]);
    expect(service.people()).toEqual([{ ...apiPerson, id: '1' }]);

    service.loadPeople().subscribe(people => expect(people).toEqual([
      { ...apiPerson, id: '1' },
      { ...apiPerson, url: `${endpoint}/2`, name: 'Leia Organa', id: '2' },
    ]));
    http.expectOne(endpoint).flush([
      apiPerson,
      { ...apiPerson, url: `${endpoint}/2`, name: 'Leia Organa' },
    ]);
    expect(service.people()).toHaveLength(2);
  });

  it('retries the next load after a failed request', () => {
    let result: readonly unknown[] | undefined;
    service.loadPeople().subscribe(people => result = people);
    http.expectOne(endpoint).flush('unavailable', { status: 503, statusText: 'Unavailable' });
    expect(result).toEqual([]);

    service.loadPeople().subscribe(people => result = people);
    http.expectOne(endpoint).flush([apiPerson]);
    expect(result).toEqual([{ ...apiPerson, id: '1' }]);
    expect(service.people()).toEqual([{ ...apiPerson, id: '1' }]);
  });

  it('replaces local additions and deletions with the next API response', () => {
    service.loadPeople().subscribe();
    http.expectOne(endpoint).flush([apiPerson]);
    const first = service.addPerson({ ...fields, name: 'New person' });
    const second = service.addPerson({ ...fields, name: 'Another person' });
    expect(first.id).toMatch(/^local-/);
    expect(second.id).not.toBe(first.id);
    service.deletePerson('1');
    service.deletePerson(second.id);
    expect(service.people()).toEqual([first]);

    let result: readonly unknown[] | undefined;
    service.loadPeople().subscribe(people => result = people);
    http.expectOne(endpoint).flush([
      apiPerson,
      { ...apiPerson, url: `${endpoint}/2`, name: 'Leia Organa' },
    ]);
    expect(result).toEqual([
      { ...apiPerson, id: '1' },
      { ...apiPerson, url: `${endpoint}/2`, name: 'Leia Organa', id: '2' },
    ]);
    expect(service.people()).toEqual(result);
  });

  it('replaces an empty response on the next load and preserves unknown field values', () => {
    service.loadPeople().subscribe();
    http.expectOne(endpoint).flush([]);
    expect(service.people()).toEqual([]);

    let result: readonly unknown[] | undefined;
    service.loadPeople().subscribe(people => result = people);
    http.expectOne(endpoint).flush([{ ...apiPerson, mass: 'unknown', gender: 'n/a' }]);
    expect(result).toEqual([{ ...apiPerson, mass: 'unknown', gender: 'n/a', id: '1' }]);
  });
});
