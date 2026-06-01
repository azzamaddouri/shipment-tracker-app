import { AfterViewInit, Component, computed, DestroyRef, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { SHIPMENT_STATUS, ShipmentService, ShipmentStatus, ShipmentWebSocketService, STATUS_LABELS, WebSocketService } from '../../../core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import { RoutePoint, LocationUpdateMessage } from '../../../core/models/route-point.model';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-shipment-tracking',
  imports: [DatePipe,RouterLink,ReactiveFormsModule],
  templateUrl: './shipment-tracking.component.html',
  styleUrl: './shipment-tracking.component.css',
})
export class ShipmentTrackingComponent implements OnInit, AfterViewInit, OnDestroy  {
  
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private map:          L.Map | null         = null;
  private polyline:     L.Polyline | null    = null;
  private liveMarker:   L.Marker | null      = null;
  private originMarker: L.Marker | null      = null;
  private destMarker:   L.Marker | null      = null;

readonly activeTab     = signal<'timeline'|'details'|'map'>('timeline');
  readonly liveUpdate = signal<boolean>(false);
  
  private readonly shipmentService = inject(ShipmentService);
  private readonly wsService = inject(ShipmentWebSocketService);

  readonly loading = this.shipmentService.loading;
  readonly error = this.shipmentService.error;
  readonly shipment = this.shipmentService.trackedShipment;
  readonly timeline = this.shipmentService.timeline;
    readonly route = this.shipmentService.route;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly currentTrackingNumber = computed(()=>
    this.activatedRoute.snapshot.paramMap.get('trackingNumber') ?? '');

  readonly isDelivered = computed(()=>
    this.shipment()?.status === SHIPMENT_STATUS.DELIVERED);

  readonly emailSuccess = signal(false);
  readonly emailLoading = signal(false);

  readonly STATUS_LABELS = STATUS_LABELS;
  readonly SHIPMENT_STATUS = SHIPMENT_STATUS;
  
  readonly STATUS_CONFIG: Record<ShipmentStatus, { bg: string; text: string; ring: string; dot: string; step: string }> = {
    [SHIPMENT_STATUS.ORDER_PLACED]:     { bg:'bg-blue-50',   text:'text-blue-700',   ring:'ring-blue-200',   dot:'bg-blue-500',   step:'bg-blue-500'   },
    [SHIPMENT_STATUS.PROCESSING]:       { bg:'bg-amber-50',  text:'text-amber-700',  ring:'ring-amber-200',  dot:'bg-amber-500',  step:'bg-amber-500'  },
    [SHIPMENT_STATUS.PICKED_UP]:        { bg:'bg-purple-50', text:'text-purple-700', ring:'ring-purple-200', dot:'bg-purple-500', step:'bg-purple-500' },
    [SHIPMENT_STATUS.IN_TRANSIT]:       { bg:'bg-cyan-50',   text:'text-cyan-700',   ring:'ring-cyan-200',   dot:'bg-cyan-500',   step:'bg-cyan-500'   },
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: { bg:'bg-yellow-50', text:'text-yellow-700', ring:'ring-yellow-200', dot:'bg-yellow-500', step:'bg-yellow-500' },
    [SHIPMENT_STATUS.DELIVERED]:        { bg:'bg-green-50',  text:'text-green-700',  ring:'ring-green-200',  dot:'bg-green-500',  step:'bg-green-500'  },
    [SHIPMENT_STATUS.EXCEPTION]:        { bg:'bg-red-50',    text:'text-red-700',    ring:'ring-red-200',    dot:'bg-red-500',    step:'bg-red-500'    },
  };


  readonly progressPercent = computed(() => {
  const status = this.shipment()?.status;
  if (!status || status === SHIPMENT_STATUS.EXCEPTION) return 0;

  const idx = this.PROGRESS_STEPS.indexOf(status);
  if (idx === -1) return 0;

  const total = this.PROGRESS_STEPS.length - 1; // gaps between steps = 5
  return idx === 0 ? 0 : Math.round((idx / total) * 100);
});

  readonly PROGRESS_STEPS: ShipmentStatus[] = [
    SHIPMENT_STATUS.ORDER_PLACED,
    SHIPMENT_STATUS.PROCESSING,
    SHIPMENT_STATUS.PICKED_UP,
    SHIPMENT_STATUS.IN_TRANSIT,
    SHIPMENT_STATUS.OUT_FOR_DELIVERY,
    SHIPMENT_STATUS.DELIVERED,
  ];

  isStepCompleted(step: ShipmentStatus): boolean {
    const order = this.PROGRESS_STEPS;
    const currentStatus = this.shipment()?.status;
    if (!currentStatus) return false;
    if(currentStatus === SHIPMENT_STATUS.EXCEPTION) return false;
    return order.indexOf(currentStatus) >= order.indexOf(step);
  }

  isStepCurrent(step: ShipmentStatus): boolean {
    return this.shipment()?.status === step;
  }

   private readonly ORIGIN_ICON = L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;background:#0f172a;border-radius:50%;
                       border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);
                       display:flex;align-items:center;justify-content:center;">
             <div style="width:10px;height:10px;background:white;border-radius:50%"></div>
           </div>`,
    iconSize:   [32, 32],
    iconAnchor: [16, 16],
  });

  private readonly DEST_ICON = L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;background:#f97316;border-radius:50%;
                       border:3px solid white;box-shadow:0 2px 8px rgba(249,115,22,.4);
                       display:flex;align-items:center;justify-content:center;">
             <div style="width:10px;height:10px;background:white;border-radius:50%"></div>
           </div>`,
    iconSize:   [32, 32],
    iconAnchor: [16, 16],
  });

  private readonly LIVE_ICON = L.divIcon({
    className: '',
    html: `<div style="position:relative;width:20px;height:20px;">
             <div style="position:absolute;inset:0;background:rgba(249,115,22,.25);
                         border-radius:50%;animation:ping 1.2s ease-out infinite;"></div>
             <div style="position:absolute;inset:3px;background:#f97316;border-radius:50%;
                         border:2px solid white;box-shadow:0 2px 6px rgba(249,115,22,.5);"></div>
           </div>`,
    iconSize:   [20, 20],
    iconAnchor: [10, 10],
  });

  print() {
   window.print();
  }

  ngOnInit() : void {
    const tracking = this.activatedRoute.snapshot.paramMap.get('trackingNumber');
    if (!tracking) { this.router.navigate(['/']); return; }

    this.shipmentService.trackByNumber(tracking);
    this.shipmentService.loadTimeline(tracking);
        this.shipmentService.loadRoute(tracking);   // ← load route on init

    this._subscribeToLiveUpdates(tracking);
        this._subscribeToLiveLocation(tracking);    // ← subscribe to GPS stream

  }

  private _subscribeToLiveUpdates(trackingNumber: string): void {
    this.wsService
    .trackShipment(trackingNumber)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(()=>{
      this.liveUpdate.set(true);
      setTimeout(() => this.liveUpdate.set(false), 3000);
    
    });
  }

  getStatusConfig(status: ShipmentStatus) {
    return this.STATUS_CONFIG[status] ?? 
    this.STATUS_CONFIG[SHIPMENT_STATUS.ORDER_PLACED];
  }

  setTab(tab: 'timeline' | 'details' | 'map'): void {
    this.activeTab.set(tab);
    if (tab === 'map') {
      // Wait one tick for the DOM element to render
      setTimeout(() => this._initMap(), 50);
    }
  }

  subscribeEmail(): void {
  if (this.emailForm.invalid || !this.shipment()) {
    this.emailForm.markAllAsTouched();
    return;
  }

  this.emailLoading.set(true);

  const trackingNumber = this.currentTrackingNumber();
  const { email } = this.emailForm.getRawValue();

  this.shipmentService
    .subscribeToEmailUpdates(trackingNumber, email)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.emailSuccess.set(true);
        this.emailLoading.set(false);
        this.emailForm.reset();
      },
      error: () => {
        this.emailLoading.set(false);
      },
    });
}
  hasEmailError(): boolean {
    const control = this.emailForm.get('email');
    return !!(control?.invalid && control?.touched);
  }

  ngAfterViewInit(): void {
    // Delay slightly so @if(activeTab()==='map') has rendered the container
    if (this.activeTab() === 'map') this._initMap();
  }
 private _initMap(): void {
    if (this.map || !this.mapContainer?.nativeElement) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center:    [48.8566, 2.3522],   // Paris as default
      zoom:      5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Draw what we already have
    this._drawRoute(this.route());
    this._addOriginDestinationPins();
  }

  private _addOriginDestinationPins(): void {
    if (!this.map || !this.shipment()) return;
    const s = this.shipment()!;
    const pts = this.route();

    // Origin — first route point if available
    if (pts.length > 0) {
      const first = pts[0];
      this.originMarker = L.marker([first.latitude, first.longitude], { icon: this.ORIGIN_ICON })
        .bindPopup(`<b>Origin</b><br>${s.origin}`)
        .addTo(this.map);
    }

    // Last known point = live carrier position
    if (pts.length > 0) {
      const last = pts[pts.length - 1];
      this.liveMarker = L.marker([last.latitude, last.longitude], { icon: this.LIVE_ICON })
        .bindPopup(`<b>Current location</b><br>${last.label ?? s.currentLocation ?? ''}`)
        .addTo(this.map);
    }
  }

  private _drawRoute(points: RoutePoint[]): void {
    if (!this.map || points.length === 0) return;

    const latlngs = points.map(p => [p.latitude, p.longitude] as L.LatLngTuple);

    if (this.polyline) {
      this.polyline.setLatLngs(latlngs);
    } else {
      this.polyline = L.polyline(latlngs, {
        color:     '#f97316',
        weight:    3,
        opacity:   0.8,
        dashArray: '6 4',
      }).addTo(this.map);
    }

    // Fit map to route
    this.map.fitBounds(this.polyline.getBounds(), { padding: [40, 40] });
  }

  // ── Live GPS subscription ──────────────────────────────────────────────

  private _subscribeToLiveLocation(trackingNumber: string): void {
  this.wsService
    .trackShipmentLocation(trackingNumber)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((loc: LocationUpdateMessage) => {
      const point: RoutePoint = {
        latitude:   loc.latitude,
        longitude:  loc.longitude,
        label:      loc.label,
        recordedAt: loc.recordedAt,
      };

      // 1. append first
      this.shipmentService.appendRoutePoint(point);

      // 2. update map using the UPDATED route signal
      if (this.map) {
        this._updateLiveMarker(point);
        this._drawRoute(this.route()); // ← reads signal AFTER append ✅
      } else if (this.activeTab() === 'map') {
        // map tab is active but map not initialized yet
        setTimeout(() => this._initMap(), 50);
      }
    });
}

  private _updateLiveMarker(point: RoutePoint): void {
    if (!this.map) return;
    const latlng: L.LatLngTuple = [point.latitude, point.longitude];

    if (this.liveMarker) {
      this.liveMarker.setLatLng(latlng);
      this.liveMarker
        .getPopup()
        ?.setContent(`<b>Current location</b><br>${point.label ?? ''}`);
    } else {
      this.liveMarker = L.marker(latlng, { icon: this.LIVE_ICON })
        .bindPopup(`<b>Current location</b><br>${point.label ?? ''}`)
        .addTo(this.map);
    }
  }
  ngOnDestroy(): void {
    this.map?.remove();
  }


}
