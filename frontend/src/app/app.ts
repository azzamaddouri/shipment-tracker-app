import { Component, signal } from '@angular/core';
import { ShipmentGrid } from './components/shipment-grid/shipment-grid';
import { CreateShipment } from './components/create-shipment/create-shipment';

@Component({
  selector: 'app-root',
  imports: [ShipmentGrid,CreateShipment],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('shipment-tracker');
}
