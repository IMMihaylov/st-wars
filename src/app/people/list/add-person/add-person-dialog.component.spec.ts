import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AddPersonDialogComponent } from './add-person-dialog.component';
import { PeopleService } from '../../people.service';

describe('Add person dialog', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  }));


  it('cancels without adding a person', async () => {
    const dialog = TestBed.inject(MatDialog);
    dialog.open(AddPersonDialogComponent);
    await TestBed.inject(ApplicationRef).whenStable();
    const cancel = document.querySelector<HTMLButtonElement>('[data-action="cancel"]');
    expect(cancel).not.toBeNull();
    cancel!.click();
    await TestBed.inject(ApplicationRef).whenStable();
    await vi.waitFor(() => expect(dialog.openDialogs).toHaveLength(0));
    expect(TestBed.inject(PeopleService).people()).toHaveLength(0);
  });
});

