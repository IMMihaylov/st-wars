import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';

const NETWORK_ERROR_STATUS = 0;
const RETRYABLE_STATUS_CODES: readonly number[] = [
  NETWORK_ERROR_STATUS,
  HttpStatusCode.BadGateway,
  HttpStatusCode.ServiceUnavailable,
  HttpStatusCode.GatewayTimeout,
];

export const retryInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.method !== 'GET') return next(request);

  /**
   * Retry failed GET requests once for network errors and transient gateway/service failures.
   * A status of 0 means the browser received no HTTP response, such as a network failure.
   * The retry delay is 500ms.
   */
  return next(request).pipe(
    retry({
      count: 1,
      delay: (error: HttpErrorResponse) =>
        RETRYABLE_STATUS_CODES.includes(error.status)
          ? timer(500)
          : throwError(() => error),
    }),
  );
};
