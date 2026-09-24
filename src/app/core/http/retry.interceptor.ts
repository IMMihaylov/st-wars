import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.method !== 'GET') return next(request);

  /**
   * Intercepts HTTP requests and retries failed GET requests for specific status codes.
   * Only retries for status codes 0, 502, 503, and 504.
   * 502 - Bad Gateway
   * 503 - Service Unavailable
   * 504 - Gateway Timeout
   * The retry delay is 500ms.
   */
  return next(request).pipe(
    retry({
      count: 1,
      delay: (error: HttpErrorResponse) =>
        [0, 502, 503, 504].includes(error.status)
          ? timer(500)
          : throwError(() => error),
    }),
  );
};
