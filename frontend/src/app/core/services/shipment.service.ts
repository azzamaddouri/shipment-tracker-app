import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';
import { CreateShipmentDto, Shipment, ShipmentWebSocketService, UpdateStatusDto } from '..';
import { environment } from '../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const BASE_URL = environment.api.server;


export interface ShipmentState {
  shipments : Shipment[],
  selectedShipment : Shipment | null,
  trackedShipment: Shipment | null,
  loading: boolean;
  error: string | null;
}
 const initialState : ShipmentState = {
   shipments: [],
   selectedShipment: null,
   trackedShipment: null,
   loading: false,
   error: null,
 }

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {
  getAllShipments() {
    throw new Error('Method not implemented.');
  }

  private destroyRef = inject(DestroyRef);
  private http = inject(HttpClient);
  private webSocketService = inject(ShipmentWebSocketService);

  private readonly _state = signal<ShipmentState>(initialState);

  readonly shipments = computed(() => this._state().shipments);
  readonly selectedShipment = computed(() => this._state().selectedShipment);
  readonly trackedShipment = computed(() => this._state().trackedShipment);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);


  private readonly _loadAll$ = new Subject<void>();
  private readonly _loadById$ = new Subject<number>();
  private readonly _trackByNumber$ = new Subject<string>();

  constructor(){
    this._setupLoadAll();
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

  private _patchState(partial: Partial<ShipmentState>): void {
    this._state.update(state => ({...state, ...partial}))
  }


 


  getShipmentById(id: number): Observable<Shipment> {
    return this.http.get<Shipment>(`${BASE_URL}/${id}`);
  }
  
  getShipmentByTrackingNumber(trackingNumber: string): Observable<Shipment> {
    return this.http.get<Shipment>(`${BASE_URL}/track/${trackingNumber}`);
  }
}
