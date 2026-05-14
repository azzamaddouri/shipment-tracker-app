import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Shipment, SHIPMENT_STATUS, 
  ShipmentStatus, STATUS_LABELS, StatusUpdateMessage, 
  ShipmentWebSocketService, ShipmentService } from '../../../../core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-shipment-grid',
  imports: [DatePipe, NgClass],
  templateUrl: './shipment-grid.html',
  styleUrl: './shipment-grid.css',
})
export class ShipmentGrid implements OnInit {
  
  private shipmentService = inject(ShipmentService);


  readonly shipments = this.shipmentService.shipments;
  readonly loading = this.shipmentService.loading;
  readonly error = this.shipmentService.error;

  
  private destroyRef = inject(DestroyRef);
  private webSocketService = inject(ShipmentWebSocketService);
  STATUS_LABELS = STATUS_LABELS;

  readonly STATUS_BADGE_CLASS_MAP: Record<ShipmentStatus, string> = {
    [SHIPMENT_STATUS.ORDER_PLACED]: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    [SHIPMENT_STATUS.PROCESSING]: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    [SHIPMENT_STATUS.PICKED_UP]: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
    [SHIPMENT_STATUS.IN_TRANSIT]: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20',
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
    [SHIPMENT_STATUS.DELIVERED]: 'bg-green-500/10 text-green-400 ring-green-500/20',
    [SHIPMENT_STATUS.EXCEPTION]: 'bg-red-500/10 text-red-400 ring-red-500/20',
  };

  ngOnInit(): void {
    this.shipmentService.loadAll();

    this.handleUpdate();

    console.log('RUNNING');
  }

  private handleUpdate(): void {
    this.webSocketService
      .getStatusUpdates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update) => {
          this.handleStatusUpdate(update);
      });
  }

  private handleStatusUpdate(update: StatusUpdateMessage): void {
   /*  this.shipments.update((shipments) => {
      const updatedShipment = shipments.find((shipment) => shipment.id === update.shipmentId);
      if (!updatedShipment) {
        return shipments;
      }

      const updatedShipments = shipments.map((shipment) => {
        if (shipment.id !== updatedShipment.id) return shipment;

        return {
          ...shipment,
          status: update.status,
          currentLocation: update.currentLocation,
          updatedAt: update.timestamp,
        };
      });

      return updatedShipments;
    }); */
  }



  getStatusBadgeClass(status: ShipmentStatus): string {
    return this.STATUS_BADGE_CLASS_MAP[status];
  }
}