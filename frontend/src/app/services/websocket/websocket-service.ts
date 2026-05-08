import { DestroyRef, inject, Injectable } from '@angular/core';
import { Client, StompSubscription, Versions } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import {  StatusUpdateMessage } from '../../models/shipment.model';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {

  private destroyRef = inject(DestroyRef);

  private client!:Client;
  private connected$ = new BehaviorSubject<boolean>(false);
  private status$ = new BehaviorSubject<StatusUpdateMessage | null>(null);
  private subscriptions = new Map<string, StompSubscription>();

  constructor() {
    this.initClient();
      this.destroyRef.onDestroy(() => {
        this.disconnect();
        this.status$.complete();
        this.connected$.complete();
    });
  }


  disconnect() : void {
    if (this.client.active) {
      console.log('Disconnecting WebSocket');
      this.client.deactivate();

      this.subscriptions.forEach((subscription) => subscription.unsubscribe());
      this.subscriptions.clear();

      this.client.deactivate();
    }
  }


  initClient():void{
    this.client = new Client({
      brokerURL: 'http://localhost:8080/ws',
      stompVersions: Versions.default,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectionTimeout: 10000,

      onConnect: (frame) => {
        console.log('WebSocket connection established');
        this.connected$.next(true);
        this.subscribeToTopics();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.connected$.next(false);

      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        this.connected$.next(false);
      },
      onDisconnect: (frame) => {
        console.log('WebSocket connection closed');
        this.connected$.next(false);
        this.subscriptions.clear();
      }
    });
  }


  connect():void{
    if (this.client.active) {
     console.log('WebSocket is already connected or connecting');
      return;
    }
    this.client.activate();
  }


  private subscribeToTopics():void{
    const subscription = this.client.subscribe('/topic/shipments', (message) => {
      console.log('Received message:', message.body);
      try {
        const shipmentUpdateMessage = JSON.parse(message.body) as StatusUpdateMessage;
    
        this.status$.next(shipmentUpdateMessage);

      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscriptions.set('/topic/shipments', subscription);
  }


  getStatusUpdates() : Observable<StatusUpdateMessage | null>{
    return this.status$.asObservable();
  }


  isConnected(): Observable<boolean>{
    return this.connected$.asObservable();
  }


}
