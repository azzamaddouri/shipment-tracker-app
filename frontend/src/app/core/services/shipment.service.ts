import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { CreateShipmentDto, PublicShipmentActivity, Shipment, ShipmentStatus, ShipmentWebSocketService, STATUS_LABELS, UpdateStatusDto } from '..';
import { environment } from '../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimelineEvent } from '../models/shipment-timeline.model';
import { RoutePoint } from '../models/route-point.model';

const BASE_URL = `${environment.api.server}/shipments`;
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
  timeline: TimelineEvent[];
  route: RoutePoint[];
  loading: boolean;
  error: string | null;
}
 const initialState : ShipmentState = {
   shipments: [],
   selectedShipment: null,
   trackedShipment: null,
   notifications:[],
   timeline: [],
   route: [],
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
  readonly timeline = computed(() => this._state().timeline);
  readonly route = computed(() => this._state().route);
  readonly notifications    = computed(() => this._state().notifications);

  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly hasNotifications = computed(() => this._state().notifications.length > 0);

  private readonly _loadAll$ = new Subject<void>();
  private readonly _loadById$ = new Subject<number>();
  private readonly _trackByNumber$ = new Subject<string>();
  private readonly _loadTimeline$ = new Subject<string>();
  private readonly _loadRoute$ = new Subject<string>();


  constructor(){
    this._setupLoadAll();
    this._setupWebSocketUpdates();
    this._setupTrackByNumber();
    this._setupLoadTimeline();
    this._setupLoadRoute();

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
  private _setupLoadRoute(): void {
  this._loadRoute$
    .pipe(
      switchMap((trackingNumber) =>
        this.http.get<RoutePoint[]>(
          `${BASE_URL}/track/${trackingNumber}/route`
        ).pipe(catchError(() => of([])))
      ),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe((route) => this._patchState({ route }));
}
loadRoute(trackingNumber: string): void {
  this._loadRoute$.next(trackingNumber);
}
appendRoutePoint(point: RoutePoint): void {
  this._patchState({
    route: [...this._state().route, point],
  });
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


  getRecentPublicActivity(): Observable<PublicShipmentActivity[]> {
    return this.http.get<PublicShipmentActivity[]>(`${BASE_URL}/recent/public`)
    .pipe(
      catchError((err) => {
        console.error('Failed to load recent public activity', err);
        return  of([]);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  subscribeToEmailUpdates(trackingNumber: string, email: string): Observable<void> {
  return this.http
    .post<void>(`${BASE_URL}/track/${trackingNumber}/subscribe`, { email })
    .pipe(
      catchError((err) => {
        this._patchState({ error: err.message ?? 'Failed to subscribe' });
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    );
}


  private _setupTrackByNumber(): void {
    this._trackByNumber$
    .pipe(
      tap( () =>
        this._patchState({ loading: true, error: null,
          trackedShipment: null })),
          switchMap((trackingNumber) =>
            this.http.get<Shipment>(`${BASE_URL}/track/${trackingNumber}`).pipe(
              catchError((err) => {
                this._patchState({loading:false,error: err.message ?? `Failed to track shipment with tracking number ${trackingNumber}`});
                return EMPTY;
              })
            )
          ),
      takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((trackedShipment) => {
          this._patchState({ trackedShipment, loading: false });
        })
   }

   private _setupLoadTimeline(): void {
    this._loadTimeline$
    .pipe(
      switchMap((trackingNumber) =>
        this.http.get<TimelineEvent[]>(`${BASE_URL}/track/${trackingNumber}/history`).pipe(
          catchError((err) => {
            console.error('Failed to load shipment timeline', err);
            return of([]);
          })
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe((timeline) => {
      this._patchState({ timeline });
    });

   }

   trackByNumber(trackingNumber: string): void {
    this._trackByNumber$.next(trackingNumber);
   }

   loadTimeline(trackingNumber: string): void {
    this._loadTimeline$.next(trackingNumber);
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

              trackedShipment:
              this._state().trackedShipment?.trackingNumber === update.trackingNumber
              ? {
                  ...this._state().trackedShipment!,
                  status:          update.status,
                  currentLocation: update.currentLocation,
                  updatedAt:       update.timestamp,
                }
              : this._state().trackedShipment,
        });

        // 4. Prepend to timeline so it updates live
      const newEvent = {
        status:    update.status,
        location:  update.currentLocation,
        timestamp: update.timestamp,
        note:      undefined,
      };
      this._patchState({
        timeline: [newEvent, ...this._state().timeline],
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
