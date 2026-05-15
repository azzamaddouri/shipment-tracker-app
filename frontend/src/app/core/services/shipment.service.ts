import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';
import { CreateShipmentDto, Shipment, ShipmentStatus, ShipmentWebSocketService, STATUS_LABELS, UpdateStatusDto } from '..';
import { environment } from '../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const BASE_URL = environment.api.server;
const MAX_NOTIFICATIONS = 20;

export interface ShipmentNotification {
  shipmentId:      number;
  trackingNumber:  string;
  status:          ShipmentStatus;
  currentLocation: string;
  message:         string;
  timestamp:       string;
}

export interface ShipmentState {
  shipments : Shipment[],
  selectedShipment : Shipment | null,
  trackedShipment: Shipment | null,
  notifications:     ShipmentNotification[];
  loading: boolean;
  error: string | null;
}
 const initialState : ShipmentState = {
   shipments: [],
   selectedShipment: null,
   trackedShipment: null,
   notifications:[],
   loading: false,
   error: null,
 }

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {

  private destroyRef = inject(DestroyRef);
  private http = inject(HttpClient);
  private readonly webSocketService  = inject(ShipmentWebSocketService);


  private readonly _state = signal<ShipmentState>(initialState);

  readonly shipments = computed(() => this._state().shipments);
  readonly selectedShipment = computed(() => this._state().selectedShipment);
  readonly trackedShipment = computed(() => this._state().trackedShipment);
    readonly notifications    = computed(() => this._state().notifications);

  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly hasNotifications = computed(() => this._state().notifications.length > 0);

  private readonly _loadAll$ = new Subject<void>();
  private readonly _loadById$ = new Subject<number>();
  private readonly _trackByNumber$ = new Subject<string>();

  constructor(){
    this._setupLoadAll();
    this._setupWebSocketUpdates();
  }

  private _setupLoadAll(): void {
    this._loadAll$
    .pipe(
      tap(()=> this._patchState({loading: true, error:null})),
      switchMap(() => 
        this.http.get<Shipment[]>(BASE_URL).pipe(
          catchError((err) => {
            this._patchState({loading: false,  error: err.message ?? 'Failed to load shipments'});
          return EMPTY;
          })
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe((shipments) => {
       this._patchState({ shipments, loading: false });
    })
  }

  loadAll(): void {
    this._loadAll$.next();
  }


  createShipment(dto: CreateShipmentDto) : Observable<Shipment>{
    this._patchState({ loading: true, error: null });
    return this.http.post<Shipment>(BASE_URL, dto).pipe(
      tap((newShipment) => {
        this._patchState({
          shipments: [newShipment, ...this._state().shipments],
          loading: false,
        });
      }),
      catchError((err) => {
        this._patchState({ loading: false, error: err.message ?? 'Failed to create shipment' });
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    )

  }

  updateShipmentStatus(id : number, dto: UpdateStatusDto ){
     this._patchState({ loading: true, error: null });
     return  this.http.put<Shipment>(`${BASE_URL}/${id}/status`, dto).pipe(
      tap((updatedShipment) => {
        this._patchState({
          loading: false,
          shipments: this._state().shipments.map((s) => (s.id === id ? updatedShipment : s)),
          selectedShipment: this._state().selectedShipment?.id === id
            ? updatedShipment
            : this._state().selectedShipment,
        })

      }) ,
     catchError((err) => {
        this._patchState({ loading: false, error: err.message ?? `Failed to update shipment #${id}` });
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    )

  }
  

   private _setupWebSocketUpdates(): void {
    this.webSocketService
      .getStatusUpdates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update) => {
        // 1. Update the shipments list in-place
        this._patchState({
          shipments: this._state().shipments.map((s) =>
            s.id !== update.shipmentId ? s : {
              ...s,
              status:          update.status,
              currentLocation: update.currentLocation,
              updatedAt:       update.timestamp,
            }
          ),
          // 2. Keep selectedShipment in sync
          selectedShipment:
            this._state().selectedShipment?.id === update.shipmentId
              ? {
                  ...this._state().selectedShipment!,
                  status:          update.status,
                  currentLocation: update.currentLocation,
                  updatedAt:       update.timestamp,
                }
              : this._state().selectedShipment,
        });
 
        // 3. Push notification (cap at MAX_NOTIFICATIONS)
        this._pushNotification({
          shipmentId:      update.shipmentId,
          trackingNumber:  update.trackingNumber,
          status:          update.status,
          currentLocation: update.currentLocation,
          message:         `Status updated to ${STATUS_LABELS[update.status]}`,
          timestamp:       update.timestamp,
        });
      });
  }
 private _pushNotification(notification: ShipmentNotification): void {
    const current = this._state().notifications;
    this._patchState({
      notifications: [notification, ...current].slice(0, MAX_NOTIFICATIONS),
    });
  }
  private _patchState(partial: Partial<ShipmentState>): void {
    this._state.update(state => ({...state, ...partial}))
  }

   dismissNotification(timestamp: string): void {
    this._patchState({
      notifications: this._state().notifications.filter((n) => n.timestamp !== timestamp),
    });
  }
 
  dismissAllNotifications(): void {
    this._patchState({ notifications: [] });
  }
}
