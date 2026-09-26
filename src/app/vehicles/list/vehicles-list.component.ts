import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GeneralListComponent } from '../../shared/list/list.component';
import { VehiclesService } from '../vehicles.service';
import { VEHICLE_LIST_DISPLAY_FIELDS } from '../vehicle.model';

@Component({
  selector: 'app-vehicles-list',
  imports: [
    GeneralListComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './vehicles-list.component.html',
  host: { class: 'block h-full' },
})
export class VehiclesListComponent {
  private readonly vehiclesService = inject(VehiclesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly list = viewChild(GeneralListComponent);
  readonly vehiclesLoading = this.vehiclesService.vehiclesLoading;
  readonly vehiclesLoadError = this.vehiclesService.vehiclesLoadError;

  readonly selectedId = signal<string | null>(null);
  readonly detailsOpen = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => {
        const child = this.route.firstChild;
        const detailsOpen = child?.routeConfig?.path === ':id';
        this.selectedId.set(detailsOpen ? child.snapshot.paramMap.get('id') : null);
        return detailsOpen;
      }),
    ),
    { initialValue: this.route.firstChild?.routeConfig?.path === ':id' },
  );
  readonly query = signal('');
  readonly visibleCount = signal(20);
  readonly displayFields = VEHICLE_LIST_DISPLAY_FIELDS;

  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.vehiclesService.vehicles().filter((vehicle) => vehicle.name.toLowerCase().includes(query));
  });

  readonly visible = computed(() =>
    this.query().length ? this.filtered() : this.filtered().slice(0, this.visibleCount()),
  );

  readonly hasMore = computed(() => this.visibleCount() < this.filtered().length);

  filter(value: string) {
    this.query.set(value);
    this.visibleCount.set(20);
    this.list()?.resetScroll();
  }

  loadMore() {
    this.visibleCount.update((count) => Math.min(count + 20, this.filtered().length));
  }

  reloadVehicles() {
    this.vehiclesService.loadVehicles().subscribe();
  }

  select(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  closeDetails() {
    this.router.navigate(['.'], { relativeTo: this.route });
  }
}
