import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { VaderFigureComponent } from './vader-figure.component';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  imports: [MatIconModule, VaderFigureComponent],
})
export class StartComponent {}
