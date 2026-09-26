import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { VehicleRecord } from './vehicle.model';
import { VehiclesService } from './vehicles.service';

export const vehiclesResolver: ResolveFn<readonly VehicleRecord[]> = () =>
  inject(VehiclesService).loadVehicles();
