import { Component, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import {
  SHIPMENT_STATUS,
  ShipmentService,
  ShipmentStatus,
  STATUS_LABELS,
} from '../../../../core';

@Component({
  selector: 'app-notification',
  imports: [DatePipe, NgClass],         
  templateUrl: './notification.html',
  styleUrl:    './notification.css',
})
export class NotificationComponent {
  private readonly shipmentService = inject(ShipmentService);

  readonly notifications    = this.shipmentService.notifications;
  readonly hasNotifications = this.shipmentService.hasNotifications;

  readonly STATUS_LABELS = STATUS_LABELS;

  readonly STATUS_BADGE_CLASS_MAP: Record<ShipmentStatus, string> = {
    [SHIPMENT_STATUS.ORDER_PLACED]:     'bg-blue-500/10  text-blue-400   ring-blue-500/20',
    [SHIPMENT_STATUS.PROCESSING]:       'bg-amber-500/10 text-amber-400  ring-amber-500/20',
    [SHIPMENT_STATUS.PICKED_UP]:        'bg-purple-500/10 text-purple-400 ring-purple-500/20',
    [SHIPMENT_STATUS.IN_TRANSIT]:       'bg-cyan-500/10  text-cyan-400   ring-cyan-500/20',
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
    [SHIPMENT_STATUS.DELIVERED]:        'bg-green-500/10 text-green-400  ring-green-500/20',
    [SHIPMENT_STATUS.EXCEPTION]:        'bg-red-500/10   text-red-400    ring-red-500/20',
  };

  getStatusBadgeClass(status: ShipmentStatus): string {
    return this.STATUS_BADGE_CLASS_MAP[status] ?? '';
  }

  dismiss(timestamp: string): void {
    this.shipmentService.dismissNotification(timestamp);
  }

  dismissAll(): void {
    this.shipmentService.dismissAllNotifications();
  }
}