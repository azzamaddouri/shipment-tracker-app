import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';
import { ShipmentGrid } from './components/shipment-grid/shipment-grid';

@Component({
  selector: 'app-root',
  imports: [ShipmentGrid,Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('shipment-tracker');
}
