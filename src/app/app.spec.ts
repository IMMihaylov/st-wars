import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { routes } from './app.routes';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('opens Start with all four navigation links and no API request', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1')?.textContent).toContain('Probeaufgabe Angular');
    expect([...element.querySelectorAll('nav a')].map(a => a.textContent?.trim())).toEqual([
      'Start',
      'People',
      'Vehicles',
      'Movies',
    ]);
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });

  it('shows a hamburger on mobile and closes navigation after selecting Start', async () => {
    TestBed.overrideProvider(BreakpointObserver, { useValue: { observe: () => of({ matches: true }) } });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Open navigation"]');
    expect(button.textContent).toContain('\u2630');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    fixture.nativeElement.querySelector('nav a').click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(TestBed.inject(Router).url).toBe('/start');
  });
});
