import { Component, computed, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { DatePipe } from '@angular/common';
import { PeopleService } from '../people.service';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';
import { PersonDetails } from '../person.model';
import { DetailsFieldsComponent } from '../../shared/details-fields/details-fields.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { PERSON_DETAIL_FIELDS, PLANET_DETAIL_FIELDS, SPECIES_DETAIL_FIELDS, VEHICLE_DETAIL_FIELDS } from './details-fields.config';

@Component({
  selector: 'app-people-details',
  imports: [MatButtonModule, MatListModule, DatePipe, DetailsFieldsComponent, SkeletonComponent],
  templateUrl: './people-details.component.html',
  styleUrl: './people-details.component.scss',
})
export class PeopleDetailsComponent {
  readonly personFields = PERSON_DETAIL_FIELDS;
  readonly planetFields = PLANET_DETAIL_FIELDS;
  readonly vehicleFields = VEHICLE_DETAIL_FIELDS;
  readonly speciesFields = SPECIES_DETAIL_FIELDS;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly peopleService = inject(PeopleService);
  private readonly dialog = inject(MatDialog);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly person = computed(() =>
    this.peopleService.people().find((person) => person.id === this.params().get('id')),
  );
  readonly details = signal<PersonDetails | null>(null);

  constructor() {
    effect((onCleanup) => {
      const person = this.person();
      this.details.set(null);
      if (!person || person.id.startsWith('local-')) return;

      const subscription = this.peopleService.loadPersonDetails(person).subscribe({
        next: (data) => this.details.set(data),
        error: (error) => console.error('Error loading person details:', error),
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  close() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  deletePerson() {
    const person = this.person();
    if (!person) return;

    this.dialog
      .open(ConfirmDeleteDialogComponent, {
        data: { personName: person.name },
        width: '300px',
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.peopleService.deletePerson(person.id);
          this.close();
        }
      });
  }
}
