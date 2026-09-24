import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { AddPersonDialogComponent } from './add-person/add-person-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GeneralListComponent } from '../../shared/list/list.component';
import { PeopleService } from '../people.service';
import { PERSON_LIST_DISPLAY_FIELDS } from '../person.model';

@Component({
  selector: 'app-people-list',
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
  templateUrl: './people-list.component.html',
  host: { class: 'block h-full' },
})
export class PeopleListComponent {
  private readonly peopleService = inject(PeopleService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly list = viewChild(GeneralListComponent);
  readonly peopleLoading = this.peopleService.peopleLoading;
  readonly peopleLoadError = this.peopleService.peopleLoadError;

  readonly selectedId = signal<string | null>(null);
  readonly detailsOpen = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => {
        const child = this.route.firstChild;
        if (child) this.selectedId.set(child.snapshot.paramMap.get('id'));
        return !!child;
      }),
    ),
    { initialValue: !!this.route.firstChild },
  );
  readonly query = signal('');
  readonly visibleCount = signal(20);
  readonly displayFields = PERSON_LIST_DISPLAY_FIELDS;

  /** computes the list of people filtered by the current query */
  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.peopleService.people().filter((person) => person.name.toLowerCase().includes(query));
  });

  /** computes the list of people currently visible in the list*/
  
  readonly visible = computed(() => {
    if (!this.query().length) {
      return this.filtered().slice(0, this.visibleCount());
    }
    return this.filtered();
  });


  readonly hasMore = computed(() => this.visibleCount() < this.filtered().length);

  filter(value: string) {
    this.query.set(value);
    this.visibleCount.set(20);
    this.list()?.resetScroll();
  }

  /** in a normal situation we are going to make another HTTP request to load more people when needed */
  loadMore() {
    this.visibleCount.update((count) => Math.min(count + 20, this.filtered().length));
  }

  reloadPeople() {
    this.peopleService.loadPeople().subscribe();
  }

  /** selects a person by id */
  select(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  /** closes the details panel */
  closeDetails() {
    this.router.navigate(['.'], { relativeTo: this.route });
  }

  async addPerson() {
    if (!await this.router.navigateByUrl('/newPerson')) return;

    this.dialog
      .open(AddPersonDialogComponent, { width: '440px', maxWidth: 'calc(100vw - 32px)' })
      .afterClosed()
      .subscribe(() => {
        if (this.router.url === '/newPerson') {
            this.router.navigateByUrl('/people', { replaceUrl: true });
        }
      });
  }
}
