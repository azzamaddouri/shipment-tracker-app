import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StatusUpdateMessage, WebSocketService } from '..';

const TOPICS = {
  STATUS_UPDATES: '/topic/shipments',
  SHIPMENT_TRACK: (trackingNumber: string) => `/topic/shipments/${trackingNumber}`,
} as const;

@Injectable({
  providedIn: 'root',
})
export class ShipmentWebSocketService {
  private readonly ws = inject(WebSocketService);

  getStatusUpdates(): Observable<StatusUpdateMessage>{
    return this.ws
    .watch<StatusUpdateMessage>(TOPICS.STATUS_UPDATES)
    .pipe(map((message) => message.payload))
  }

  trackShipment(trackingNumber: string): Observable<StatusUpdateMessage> {
    return this.ws
      .watch<StatusUpdateMessage>(TOPICS.SHIPMENT_TRACK(trackingNumber))
      .pipe(map((message) => message.payload));
  }
}


