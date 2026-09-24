import { TestBed } from '@angular/core/testing';
import { GeneralListComponent } from './list.component';

describe('General list', () => {
  it('emits selection and loads once per rendered batch only at the bottom', async () => {
    const fixture = TestBed.createComponent(GeneralListComponent);
    fixture.componentRef.setInput('items', [{ id: '1', name: 'Luke' }]);
    fixture.componentRef.setInput('hasMore', true);
    const selected: string[] = [];
    let loads = 0;
    fixture.componentInstance.itemSelected.subscribe(id => selected.push(id));
    fixture.componentInstance.loadMore.subscribe(() => loads++);
    await fixture.whenStable();
    const row = fixture.nativeElement.querySelector('button');
    expect(row).not.toBeNull();
    row.click();
    expect(selected).toEqual(['1']);
    const viewport: HTMLElement = fixture.nativeElement.querySelector('[aria-label="People list"]');
    Object.defineProperties(viewport, { clientHeight: { value: 100 }, scrollHeight: { value: 300 } });
    viewport.scrollTop = 100;
    viewport.dispatchEvent(new Event('scroll'));
    expect(loads).toBe(0);
    viewport.scrollTop = 199.5;
    viewport.dispatchEvent(new Event('scroll'));
    viewport.dispatchEvent(new Event('scroll'));
    expect(loads).toBe(1);
    fixture.componentRef.setInput('items', [{ id: '1', name: 'Luke' }, { id: '2', name: 'Leia' }]);
    await fixture.whenStable();
    viewport.dispatchEvent(new Event('scroll'));
    expect(loads).toBe(2);
    fixture.componentRef.setInput('hasMore', false);
    await fixture.whenStable();
    viewport.dispatchEvent(new Event('scroll'));
    expect(loads).toBe(2);
  });
});
