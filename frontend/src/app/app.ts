import { Component, signal } from '@angular/core';
import { ShipmentGrid } from './features/shipment/components/shipment-grid/shipment-grid';
import { CreateShipmentComponent } from './features/shipment/components/create-shipment/create-shipment';
import { UpdateShipmentComponent } from './features/shipment/components/update-shipment/update-shipment';
import { Header } from './features/shipment/components/header/header';
import { NotificationComponent } from './features/shipment/components/notification/notification';

@Component({
  selector: 'app-root',
  imports: [ShipmentGrid,CreateShipmentComponent,UpdateShipmentComponent,Header,NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('shipment-tracker');
}
