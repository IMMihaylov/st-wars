import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `
    <div class="space-y-3 rounded-xl border border-outline/40 p-4" role="status" [attr.aria-label]="label()">
      @for (width of widths; track $index) {
        <div class="h-4 animate-pulse rounded bg-outline/40 motion-reduce:animate-none"
          [style.width]="width" aria-hidden="true"></div>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class SkeletonComponent {
  readonly label = input('Loading details');
  readonly widths = ['75%', '100%', '60%'];
}
