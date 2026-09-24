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

  it('rejects whitespace and saves entered fields locally', async () => {
    const dialog = TestBed.inject(MatDialog);
    dialog.open(AddPersonDialogComponent);
    await TestBed.inject(ApplicationRef).whenStable();
    const form = document.querySelector('form');
    expect(form).not.toBeNull();
    const values: Record<string, string> = { name: '  ', height: ' unknown ', mass: ' 77 ', birth_year: ' 19BBY ', gender: ' n/a ' };
    for (const [name, value] of Object.entries(values)) {
      const input = document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await TestBed.inject(ApplicationRef).whenStable();
    expect(TestBed.inject(PeopleService).people()).toHaveLength(0);
    expect(document.querySelector('mat-error')?.textContent).toContain('invalid');
    const name = document.querySelector<HTMLInputElement>('input[name="name"]')!;
    name.value = '  New person  ';
    name.dispatchEvent(new Event('input'));
    form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await TestBed.inject(ApplicationRef).whenStable();
    expect(TestBed.inject(PeopleService).people()[0]).toMatchObject({
      name: '  New person  ', height: ' unknown ', mass: ' 77 ', birth_year: ' 19BBY ', gender: ' n/a ',
    });
    await vi.waitFor(() => expect(dialog.openDialogs).toHaveLength(0));
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });

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

