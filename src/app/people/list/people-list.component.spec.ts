import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PeopleListComponent } from './people-list.component';
import { PeopleService } from '../people.service';

describe('People list', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [PeopleListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }),
  );

  it('reveals 20/40/45 entries and filters the full collection without more HTTP', async () => {
    const service = TestBed.inject(PeopleService);
    const http = TestBed.inject(HttpTestingController);
    service.loadPeople().subscribe();
    http.expectOne('https://swapi.info/api/people').flush(
      Array.from({ length: 45 }, (_, i) => ({
        url: `https://swapi.info/api/people/${i + 1}`,
        name: i === 44 ? 'Leia Organa' : `Person ${i + 1}`,
        height: 'unknown',
        mass: 'unknown',
        birth_year: 'unknown',
        gender: 'n/a',
      })),
    );
    const fixture = TestBed.createComponent(PeopleListComponent);
    await fixture.whenStable();
    const rows = () => fixture.nativeElement.querySelectorAll('[data-item-id]');
    expect(rows().length).toBe(20);
    const viewport: HTMLElement = fixture.nativeElement.querySelector('[aria-label="People list"]');
    Object.defineProperties(viewport, {
      clientHeight: { value: 100 },
      scrollHeight: { value: 300 },
    });
    viewport.scrollTop = 200;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(rows().length).toBe(40);
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(rows().length).toBe(45);
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(rows().length).toBe(45);
    const search: HTMLInputElement = fixture.nativeElement.querySelector('input');
    search.value = '  LEIA  ';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(rows().length).toBe(1);
    expect(rows()[0].textContent).toContain('Leia Organa');
    expect(viewport.scrollTop).toBe(0);
    search.value = 'no matching person';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(rows().length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No people found');
    search.value = '';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(rows().length).toBe(20);
    http.expectNone(() => true);
    http.verify();
  });
});
