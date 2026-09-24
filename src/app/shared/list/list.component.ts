import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { FormatValuePipe } from './format-value.pipe';

export interface ListItem {
  id: string;
  [key: string]: any;
}

export interface ColumnConfig {
  key: string;
  label: string;
}

@Component({
  selector: 'app-list',
  imports: [FormatValuePipe],
  templateUrl: './list.component.html',
  host: { class: 'block flex-1 min-h-0' },
})
export class GeneralListComponent {
  readonly items = input.required<readonly ListItem[]>();
  readonly columns = input<ColumnConfig[]>([{ key: 'name', label: 'Name' }]);
  readonly hasMore = input(false);
  readonly selectedId = input<string | null>(null);
  readonly itemSelected = output<string>();
  readonly loadMore = output<void>();
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private requestedCount = -1;

  onScroll() {
    const { scrollTop, clientHeight, scrollHeight } = this.viewport().nativeElement;
    if (
      this.hasMore() &&
      this.requestedCount !== this.items().length &&
      scrollTop + clientHeight >= scrollHeight - 1
    ) {
      this.requestedCount = this.items().length;
      this.loadMore.emit();
    }
  }

  resetScroll() {
    this.requestedCount = -1;
    this.viewport().nativeElement.scrollTop = 0;
  }
}
