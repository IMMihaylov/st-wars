import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { retryInterceptor } from './core/http/retry.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([retryInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withRouterConfig({ resolveNavigationPromiseOnError: true }))
  ]
};
