import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, interval, Observable, Subject,
         switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { CarrierShipment, GpsState,
         StatusUpdatePayload } from '../models/carrier-shipment.model';

const BASE = `${environment.api.server}/shipments`;
const GPS_INTERVAL_MS = 15_000; // broadcast every 15 s

export interface CarrierState {
  shipments:         CarrierShipment[];
  activeShipment:    CarrierShipment | null;
  loading:           boolean;
  updating:          boolean;
  error:             string | null;
  gpsState:          GpsState;
  gpsError:          string | null;
  broadcastingId:    number | null;  // shipment id currently being tracked
}

const initial: CarrierState = {
  shipments:      [],
  activeShipment: null,
  loading:        false,
  updating:       false,
  error:          null,
  gpsState:       'idle',
  gpsError:       null,
  broadcastingId: null,
};

@Injectable({ providedIn: 'root' })
export class CarrierService {
  private readonly http       = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state    = signal<CarrierState>(initial);
  private _gpsWatchId: number | null = null;
  private _stopBroadcast$ = new Subject<void>();

  // ── Selectors ──────────────────────────────────────────────────────────
  readonly shipments      = computed(() => this._state().shipments);
  readonly activeShipment = computed(() => this._state().activeShipment);
  readonly loading        = computed(() => this._state().loading);
  readonly updating       = computed(() => this._state().updating);
  readonly error          = computed(() => this._state().error);
  readonly gpsState       = computed(() => this._state().gpsState);
  readonly gpsError       = computed(() => this._state().gpsError);
  readonly broadcastingId = computed(() => this._state().broadcastingId);
  readonly isBroadcasting = computed(() => this._state().broadcastingId !== null);

  readonly todayDeliveries = computed(() =>
    this._state().shipments.filter(s =>
      ['PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY'].includes(s.status)
    )
  );

  readonly completedToday = computed(() =>
    this._state().shipments.filter(s =>
      ['DELIVERED','EXCEPTION'].includes(s.status)
    )
  );

  // ── Commands ───────────────────────────────────────────────────────────

  loadMyDeliveries(): void {
    this._patch({ loading: true, error: null });
    this.http.get<CarrierShipment[]>(`${BASE}/carrier/my-deliveries`)
      .pipe(
        catchError(err => {
          this._patch({ loading: false, error: err.message ?? 'Failed to load deliveries' });
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(shipments => this._patch({ shipments, loading: false }));
  }

  selectShipment(shipment: CarrierShipment | null): void {
    this._patch({ activeShipment: shipment });
  }

  updateStatus(id: number, payload: StatusUpdatePayload): Observable<CarrierShipment> {
    this._patch({ updating: true, error: null });
    return this.http.put<CarrierShipment>(`${BASE}/${id}/status`, payload).pipe(
      tap(updated => {
        this._patch({
          updating: false,
          shipments: this._state().shipments.map(s => s.id === id ? updated : s),
          activeShipment: this._state().activeShipment?.id === id
            ? updated : this._state().activeShipment,
        });
      }),
      catchError(err => {
        this._patch({ updating: false, error: err.message ?? 'Failed to update status' });
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  // ── GPS broadcasting ────────────────────────────────────────────────────

  startBroadcasting(shipmentId: number, trackingNumber: string): void {
    if (this.isBroadcasting()) this.stopBroadcasting();

    this._patch({ gpsState: 'acquiring', broadcastingId: shipmentId, gpsError: null });

    if (!navigator.geolocation) {
      this._patch({ gpsState: 'manual', gpsError: 'GPS not available on this device.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this._patch({ gpsState: 'broadcasting' });
        this._pushLocation(trackingNumber, pos.coords.latitude, pos.coords.longitude);
        this._startPolling(shipmentId, trackingNumber);
      },
      (err) => {
        this._patch({
          gpsState: 'manual',
          gpsError: err.code === 1
            ? 'Location permission denied. Enter location manually.'
            : 'GPS unavailable. Enter location manually.',
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  stopBroadcasting(): void {
    this._stopBroadcast$.next();
    if (this._gpsWatchId !== null) {
      navigator.geolocation?.clearWatch(this._gpsWatchId);
      this._gpsWatchId = null;
    }
    this._patch({ gpsState: 'idle', broadcastingId: null, gpsError: null });
  }

  pushManualLocation(trackingNumber: string, label: string): Observable<void> {
    return this.http.post<void>(
      `${BASE}/track/${trackingNumber}/location`,
      { latitude: 0, longitude: 0, label }
    ).pipe(
      catchError(err => {
        this._patch({ error: err.message ?? 'Failed to push location' });
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  private _startPolling(shipmentId: number, trackingNumber: string): void {
    interval(GPS_INTERVAL_MS)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => new Observable<void>(obs => {
          navigator.geolocation.getCurrentPosition(
            pos => {
              this._pushLocation(trackingNumber, pos.coords.latitude, pos.coords.longitude);
              obs.complete();
            },
            () => obs.complete(),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        }))
      )
      .subscribe();
  }

  private _pushLocation(trackingNumber: string, lat: number, lng: number, label?: string): void {
    this.http.post<void>(`${BASE}/track/${trackingNumber}/location`, {
      latitude: lat, longitude: lng, label: label ?? null
    }).pipe(
      catchError(() => EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private _patch(partial: Partial<CarrierState>): void {
    this._state.update(s => ({ ...s, ...partial }));
  }
}