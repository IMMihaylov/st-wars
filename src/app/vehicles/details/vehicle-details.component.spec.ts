import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { VehicleDetailsComponent } from './vehicle-details.component';
import { VehiclesService } from '../vehicles.service';

describe('Vehicle details movie links', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    const params = new BehaviorSubject(convertToParamMap({ id: '14' }));
    TestBed.configureTestingModule({
      imports: [VehicleDetailsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: params, snapshot: { paramMap: params.value } } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(VehiclesService).loadVehicles().subscribe();
    http.expectOne('https://swapi.info/api/vehicles').flush([
      {
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
        pilots: [],
        films: ['https://swapi.info/api/films/1'],
        url: 'https://swapi.info/api/vehicles/14',
      },
    ]);
  });

  afterEach(() => http.verify());

  it('links each related film to its movie details', async () => {
    const fixture = TestBed.createComponent(VehicleDetailsComponent);
    await fixture.whenStable();
    http.expectOne('https://swapi.info/api/films/1').flush({
      title: 'A New Hope',
      release_date: '1977-05-25',
      url: 'https://swapi.info/api/films/1',
    });
    await fixture.whenStable();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '[aria-label="Navigate to movie: A New Hope"]',
    );
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/movies/1');
  });
});
