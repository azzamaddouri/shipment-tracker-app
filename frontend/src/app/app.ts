import { Component, signal } from '@angular/core';
import { ShipmentGrid } from './features/shipment/components/shipment-grid/shipment-grid';
import { CreateShipment } from './features/shipment/components/create-shipment/create-shipment';
import { UpdateShipment } from './features/shipment/components/update-shipment/update-shipment';
import { Header } from './features/shipment/components/header/header';
import { Notification } from './features/shipment/components/notification/notification';

@Component({
  selector: 'app-root',
  imports: [ShipmentGrid,CreateShipment,UpdateShipment,Header,Notification],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('shipment-tracker');
}
