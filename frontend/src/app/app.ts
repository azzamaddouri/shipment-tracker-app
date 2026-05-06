import { Component, signal } from '@angular/core';
import { ShipmentGrid } from './components/shipment-grid/shipment-grid';
import { CreateShipment } from './components/create-shipment/create-shipment';
import { UpdateShipment } from './components/update-shipment/update-shipment';

@Component({
  selector: 'app-root',
  imports: [ShipmentGrid,CreateShipment,UpdateShipment],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('shipment-tracker');
}
