import { Routes } from '@angular/router';
import { VehiclesListComponent } from './list/vehicles-list.component';
import { vehiclesResolver } from './vehicles.resolver';
import { VehicleDetailsComponent } from './details/vehicle-details.component';

export const VEHICLE_ROUTES: Routes = [
  {
    path: '', component: VehiclesListComponent, resolve: { vehicles: vehiclesResolver },
    children: [{ path: ':id', component: VehicleDetailsComponent }],
  },
];
