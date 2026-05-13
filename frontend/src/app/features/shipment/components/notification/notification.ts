import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { SHIPMENT_STATUS, 
  ShipmentStatus, 
  STATUS_LABELS, 
  StatusUpdateMessage,
  ShipmentWebsocketService } from '../../../../core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification implements OnInit {

  private destroyRef = inject(DestroyRef);
  private websocketService = inject(ShipmentWebsocketService);

  STATUS_LABELS = STATUS_LABELS
  notifications = signal<StatusUpdateMessage[]>([]);

 readonly STATUS_BADGE_CLASS_MAP: Record<ShipmentStatus, string> = {
    [SHIPMENT_STATUS.ORDER_PLACED]: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    [SHIPMENT_STATUS.PROCESSING]: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    [SHIPMENT_STATUS.PICKED_UP]: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
    [SHIPMENT_STATUS.IN_TRANSIT]: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20',
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
    [SHIPMENT_STATUS.DELIVERED]: 'bg-green-500/10 text-green-400 ring-green-500/20',
    [SHIPMENT_STATUS.EXCEPTION]: 'bg-red-500/10 text-red-400 ring-red-500/20',
  };

  getStatusBadgeClass(status: ShipmentStatus): string {
    return this.STATUS_BADGE_CLASS_MAP[status];
  }

  ngOnInit(): void {
    this.handleUpdate();
  }

  private handleUpdate(): void {
    this.websocketService.getStatusUpdates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update) => {
        if (update) {
          this.notifications.update((notifications) => [update, ...notifications]);
        }
      });
  }
}
