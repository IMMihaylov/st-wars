import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from '../app';
import { appConfig } from '../app.config';

const endpoint = 'https://swapi.info/api/people';
const imageUrl = (id: string) => `https://akabab.github.io/starwars-api/api/id/${id}.json`;

describe('People navigation', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [App], providers: [appConfig.providers, provideHttpClientTesting()],
  }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('keeps Start visible until People has data and fetches again on the next entry', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const http = TestBed.inject(HttpTestingController);
    await router.navigateByUrl('/start');
    await fixture.whenStable();
    const firstNavigation = router.navigateByUrl('/people');
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Probeaufgabe Angular');
      http.expectOne(endpoint).flush([
        { url: `${endpoint}/1`, name: 'Luke', height: '172', mass: '77', birth_year: '19BBY', gender: 'male' },
      ]);
    });
    await firstNavigation;
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('People');
    expect(fixture.nativeElement.querySelectorAll('[data-person-id]')).toHaveLength(1);

    await router.navigateByUrl('/start');
    const secondNavigation = router.navigateByUrl('/people');
    await vi.waitFor(() => http.expectOne(endpoint).flush([
      { url: `${endpoint}/1`, name: 'Luke', height: '172', mass: '77', birth_year: '19BBY', gender: 'male' },
      { url: `${endpoint}/2`, name: 'Leia', height: '150', mass: '49', birth_year: '19BBY', gender: 'female' },
    ]));
    await secondNavigation;
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[data-person-id]')).toHaveLength(2);
  });

  it('shows a People-local error with a reload action and recovers', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const http = TestBed.inject(HttpTestingController);
    const navigation = router.navigateByUrl('/people');
    await vi.waitFor(() => http.expectOne(endpoint).flush('unavailable', { status: 503, statusText: 'Unavailable' }));
    await vi.waitFor(() => http.expectOne(endpoint).flush('unavailable', { status: 503, statusText: 'Unavailable' }));
    await navigation;
    await fixture.whenStable();
    expect(router.url).toBe('/people');
    const errorRegion = fixture.nativeElement.querySelector('[role="alert"]')!;
    expect(errorRegion.textContent).toContain('Could not load People. Please try again.');
    const reloadButton = [...errorRegion.querySelectorAll('button')]
      .find(button => button.textContent.includes('Reload people'));
    expect(reloadButton).toBeTruthy();

    reloadButton!.click();
    await vi.waitFor(() => http.expectOne(endpoint).flush([
      { url: `${endpoint}/1`, name: 'Luke', height: '172', mass: '77', birth_year: '19BBY', gender: 'male' },
    ]));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[data-person-id]')).toHaveLength(1);
  });

  it('opens direct details, updates the selected person, and closes without losing the list', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const http = TestBed.inject(HttpTestingController);
    const navigation = router.navigateByUrl('/people/1');
    await vi.waitFor(() => http.expectOne(endpoint).flush([
      { url: `${endpoint}/1`, name: 'Luke', height: '172', mass: '77', birth_year: '19BBY', gender: 'male' },
      { url: `${endpoint}/2`, name: 'Leia', height: '150', mass: '49', birth_year: '19BBY', gender: 'female' },
    ]));
    await navigation;
    await fixture.whenStable();
    http.expectOne(imageUrl('1')).flush({});
    expect(fixture.nativeElement.querySelector('app-people-details h2')?.textContent).toContain('Luke');
    const selectedRows = () => [...fixture.nativeElement.querySelectorAll('[data-person-id][aria-current="true"]')]
      .map(row => row.getAttribute('data-person-id'));
    expect(selectedRows()).toEqual(['1']);
    const fields = [...fixture.nativeElement.querySelectorAll('app-people-details span')]
      .map(field => field.textContent.trim());
    expect(fields).toEqual(expect.arrayContaining([
      'Name', 'Luke', 'Height', '172', 'Mass', '77', 'Birth year', '19BBY', 'Gender', 'male',
    ]));
    fixture.nativeElement.querySelector('[data-person-id="2"]').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-people-details h2')?.textContent).toContain('Leia');
    expect(selectedRows()).toEqual(['2']);
    http.expectOne(imageUrl('2')).flush({});
    fixture.nativeElement.querySelector('[data-action="delete"]').click();
    await fixture.whenStable();
    const confirm = document.querySelector<HTMLButtonElement>('mat-dialog-container button[color="warn"]');
    expect(confirm?.textContent).toContain('Delete');
    confirm!.click();
    await vi.waitFor(() => expect(router.url).toBe('/people'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[data-person-id]').length).toBe(1);
    await router.navigateByUrl('/people/1');
    await fixture.whenStable();
    http.expectOne(imageUrl('1')).flush({});
    fixture.nativeElement.querySelector('[aria-label="Close details"]').click();
    await fixture.whenStable();
    expect(router.url).toBe('/people');
    expect(fixture.nativeElement.querySelectorAll('[data-person-id]').length).toBe(1);
    expect(selectedRows()).toEqual([]);
    await router.navigateByUrl('/people/missing');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-people-details')?.textContent).toContain('Person not found');
    expect(selectedRows()).toEqual([]);
    http.expectNone(endpoint);
  });
});
