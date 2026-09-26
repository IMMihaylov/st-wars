import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { DetailsFieldsComponent } from '../../shared/details-fields/details-fields.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { PERSON_DETAIL_FIELDS, VEHICLE_DETAIL_FIELDS } from '../../people/details/details-fields.config';
import { VehicleDetails, resourceId } from '../vehicle.model';
import { VehiclesService } from '../vehicles.service';

@Component({
  selector: 'app-vehicle-details',
  imports: [MatButtonModule, MatListModule, MatTooltipModule, RouterLink, DatePipe, DetailsFieldsComponent, SkeletonComponent],
  templateUrl: './vehicle-details.component.html',
})
export class VehicleDetailsComponent {
  readonly pilotFields = PERSON_DETAIL_FIELDS;
  readonly vehicleFields = VEHICLE_DETAIL_FIELDS;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vehiclesService = inject(VehiclesService);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly vehicle = computed(() =>
    this.vehiclesService.vehicles().find((vehicle) => vehicle.id === this.params().get('id')),
  );
  readonly details = signal<VehicleDetails | null>(null);
  readonly pilotLinks = computed(() => {
    const vehicle = this.vehicle();
    if (!vehicle) return [];

    const loadedPilots = this.details()?.pilots.data ?? [];
    return (vehicle.pilots ?? []).flatMap((url) => {
      const id = resourceId(url);
      if (!id) return [];
      const person = loadedPilots.find((pilot) => pilot.id === id);
      return [{ id, label: person?.name ?? `Pilot ${id}`, person }];
    });
  });

  constructor() {
    effect((onCleanup) => {
      const vehicle = this.vehicle();
      this.details.set(null);
      if (!vehicle) return;

      const subscription = this.vehiclesService.loadVehicleDetails(vehicle).subscribe({
        next: (data) => this.details.set(data),
        error: (error) => console.error('Error loading vehicle details:', error),
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  close() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
