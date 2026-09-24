import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.method !== 'GET') return next(request);

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
