import { DestroyRef, inject, Injectable } from '@angular/core';
import { Client, StompSubscription, Versions } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { StatusUpdateMessage } from '../models/shipment.model';

@Injectable({
  providedIn: 'root',
})
export class ShipmentWebsocketService {
  private destoryRef = inject(DestroyRef);
  private client!: Client;
  private connected$ = new BehaviorSubject<boolean>(false);
  private stausUpdate$ = new BehaviorSubject<null | StatusUpdateMessage>(null);
  private subscriptions = new Map<string, StompSubscription>();

  constructor() {

    this.initClient();

    this.destoryRef.onDestroy(() => {
      this.disconnect();
      this.stausUpdate$.complete();
      this.connected$.complete();
    });

  }

  initClient(): void {

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      stompVersions: Versions.default,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectionTimeout: 10000,

      onConnect: (frame) => {
        console.log('[WebSocket] Connected: ' + frame);
        this.connected$.next(true);
        this.subscripeToTopics();
      },

      onDisconnect: (frame) => {
        console.log('[WebSocket] Disconnected: ' + frame);
        this.connected$.next(false);
        this.subscriptions.clear();
      },

      onWebSocketError: (error) => {
        console.error('[WebSocket] Error with websocket', error);
        this.connected$.next(false);
      },

      onStompError: (frame) => {
        console.error('[WebSocket] Broker reported error: ' + frame.headers['message']);
        console.error('[WebSocket] Additional details: ' + frame.body);
        this.connected$.next(false);
      },

      onWebSocketClose: (event) => {
        console.log('[WebSocket] Closed:', event.code, event.reason);
        this.connected$.next(false);
      },
    });
  }

  private subscripeToTopics(): void {
    const subscription = this.client.subscribe('/topic/shipments', (stompMessageFrame) => {
      try {
        const statusUpdateMessage = JSON.parse(stompMessageFrame.body) as StatusUpdateMessage;
        console.log('[WebSocket] Received update:', statusUpdateMessage);
        this.stausUpdate$.next(statusUpdateMessage);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    });

    this.subscriptions.set('/topic/shipments', subscription);
  } 

  connect(): void {
    if (this.client.active) {
      console.log('[Websocket] Already connected or connecting');
      return;
    }

    this.client.activate();
  }

  disconnect(): void {
    if (this.client.active) {
      console.log('[WebSocket] Disconnecting...');

      // Unsubscribe from all topics
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // Deactivate the client
      this.client.deactivate();
    }
  }

  getStatusUpdates(): Observable<StatusUpdateMessage | null> {
    return this.stausUpdate$.asObservable();
  }

  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }


}