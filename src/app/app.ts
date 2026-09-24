import { Component, inject, signal, DestroyRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './app.html',
  host: { class: 'block h-dvh' },
})
export class App {
  readonly mobile = signal(false);
  readonly menuOpen = signal(false);
  readonly loading = signal(false);

  constructor() {
    const breakpointObserver = inject(BreakpointObserver);
    const router = inject(Router);
    const destroyRef = inject(DestroyRef);
    
    // Setup mobile signal from breakpoint observer
    breakpointObserver.observe('(max-width: 767px)').pipe(
      map(result => result.matches),
      takeUntilDestroyed(destroyRef)
    ).subscribe(isMobile => this.mobile.set(isMobile));
    
    // Setup router event handling
    router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe(event => {
      if (event instanceof NavigationStart) this.loading.set(true);
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loading.set(false);
      }
      if (event instanceof NavigationEnd) {
        this.menuOpen.set(false);
      }
    });
  }
}
