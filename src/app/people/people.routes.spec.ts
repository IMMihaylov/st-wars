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
    expect(fixture.nativeElement.querySelectorAll('[data-item-id]')).toHaveLength(1);

    await router.navigateByUrl('/start');
    const secondNavigation = router.navigateByUrl('/people');
    await vi.waitFor(() => http.expectOne(endpoint).flush([
      { url: `${endpoint}/1`, name: 'Luke', height: '172', mass: '77', birth_year: '19BBY', gender: 'male' },
      { url: `${endpoint}/2`, name: 'Leia', height: '150', mass: '49', birth_year: '19BBY', gender: 'female' },
    ]));
    await secondNavigation;
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[data-item-id]')).toHaveLength(2);
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
    expect(fixture.nativeElement.querySelectorAll('[data-item-id]')).toHaveLength(1);
  });
});
