import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { appConfig } from '../../app.config';

describe('Retry interceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [appConfig.providers, provideHttpClientTesting()],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
    http.verify();
  });

  it.each([0, 502, 503, 504])('retries a GET with status %s after a short delay', (status) => {
    const next = vi.fn();
    const error = vi.fn();
    client.get('/people').subscribe({ next, error });
    const request = http.expectOne('/people');
    if (status === 0) request.error(new ProgressEvent('error'));
    else request.flush(null, { status, statusText: 'Unavailable' });

    vi.advanceTimersByTime(499);
    http.expectNone('/people');
    expect(error).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    http.expectOne('/people').flush([]);
    expect(next).toHaveBeenCalledWith([]);
  });

  it('passes the final error through after one retry', () => {
    const error = vi.fn();
    client.get('/people').subscribe({ error });
    http.expectOne('/people').flush(null, { status: 503, statusText: 'Unavailable' });
    vi.advanceTimersByTime(500);
    http.expectOne('/people').flush(null, { status: 504, statusText: 'Timeout' });
    expect(error).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ status: 504 }));
    vi.advanceTimersByTime(1000);
    http.expectNone('/people');
  });

  it.each([['GET', 404], ['POST', 503]])('does not retry %s with status %s', (method, status) => {
    const error = vi.fn();
    client.request(method, '/people').subscribe({ error });
    http.expectOne('/people').flush(null, { status, statusText: 'Failed' });
    expect(error).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ status }));
    vi.advanceTimersByTime(1000);
    http.expectNone('/people');
  });
});

