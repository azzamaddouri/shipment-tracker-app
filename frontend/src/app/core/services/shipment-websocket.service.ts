import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Client, IMessage, StompSubscription, Versions } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WsConnectionState, WsMessage } from '..';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private destroyRef = inject(DestroyRef);

  private readonly _connectionState = signal<WsConnectionState>('DISCONNECTED');
  readonly connectionState = this._connectionState.asReadonly();

  private client!: Client;

  private readonly _topics = new Map<string,Subject<WsMessage>>();
  private readonly _subscriptions = new Map<string, StompSubscription>();


  constructor() {
    this.initClient();
  }

  initClient(): void {

    this.client = new Client({
      brokerURL: environment.api.webSocketUrl,
      stompVersions: Versions.default,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectionTimeout: 10000,

      onConnect: (frame) => {
        console.log('[WS] Connected: ' + frame);
        this._connectionState.set('CONNECTED');
        this._topics.forEach((_,topic) => this._subscribeToTopic(topic));
      },

      onDisconnect: (frame) => {
        console.log('[WS] Disconnected: ' + frame);
        this._connectionState.set('DISCONNECTED');
      },

     onWebSocketError: (event) => {
        console.error('[WS] WebSocket error:', event);
        this._connectionState.set('ERROR');
      },

      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers['message']);
        this._connectionState.set('ERROR');
      },

    });

    this._connectionState.set('CONNECTING');
    this.client.activate();

    this.destroyRef.onDestroy(() => this._disconnect());

  }

  watch<T = unknown>(topic:string): Observable<WsMessage<T>>{
    if(!this._topics.has(topic)){
      this._topics.set(topic, new Subject<WsMessage>());

      if (this.client.connected) {
        this._subscribeToTopic(topic);
      }
    }
    return this._topics.get(topic)!.asObservable() as Observable<WsMessage<T>>;
  }

  publish(destination: string, body: unknown): void {
    if (!this.client.connected) {
      console.warn('[WS] Cannot publish — not connected');
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  private _subscribeToTopic(topic: string): void {

    if(this._subscriptions.has(topic)) return;

    const stompSub  = this.client.subscribe(topic, (message:IMessage) => {
      const subject = this._topics.get(topic);
      if (!subject) return;

       try {
        const payload = JSON.parse(message.body);
        subject.next({
          topic,
          payload,
          timestamp: new Date().toISOString(),
        });
      } catch {
        console.error(`[WS] Failed to parse message on topic "${topic}":`, message.body);
      }
    });

    this._subscriptions.set(topic, stompSub);
  }

  private _disconnect(): void {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
    this._subscriptions.clear();
    this._topics.forEach((subject) => subject.complete());
    this._topics.clear();
    this.client.deactivate();
  }

}