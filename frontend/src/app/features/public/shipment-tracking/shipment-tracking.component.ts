import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { SHIPMENT_STATUS, ShipmentService, ShipmentStatus, ShipmentWebSocketService, STATUS_LABELS, WebSocketService } from '../../../core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-shipment-tracking',
  imports: [DatePipe,RouterLink,ReactiveFormsModule],
  templateUrl: './shipment-tracking.component.html',
  styleUrl: './shipment-tracking.component.css',
})
export class ShipmentTrackingComponent implements OnInit {
  

readonly activeTab     = signal<'timeline'|'details'|'map'>('timeline');
  readonly liveUpdate = signal<boolean>(false);
  
  private readonly shipmentService = inject(ShipmentService);
  private readonly wsService = inject(ShipmentWebSocketService);

  readonly loading = this.shipmentService.loading;
  readonly error = this.shipmentService.error;
  readonly shipment = this.shipmentService.trackedShipment;
  readonly timeline = this.shipmentService.timeline;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly currentTrackingNumber = computed(()=>
    this.route.snapshot.paramMap.get('trackingNumber') ?? '');

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
    const order = Object.values(SHIPMENT_STATUS);
    const status = this.shipment()?.status;
    if(!status) return 0;
    const idx = order.indexOf(status);
    return Math.round(((idx + 1) / order.length) * 100);
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

  print() {
   window.print();
  }

  ngOnInit() : void {
    const tracking = this.route.snapshot.paramMap.get('trackingNumber');
    if (!tracking) { this.router.navigate(['/']); return; }

    this.shipmentService.trackByNumber(tracking);
    this.shipmentService.loadTimeline(tracking);
    this._subscribeToLiveUpdates(tracking);
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

  setTab(tab: 'timeline' | 'details' | 'map') : void{
    this.activeTab.set(tab);
  }

  subscribeEmail():void{
    if(this.emailForm.invalid || !this.shipment()) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.emailLoading.set(true);

    setTimeout(() => {
      this.emailSuccess.set(true);
      this.emailLoading.set(false);
    },800 );
  }

  hasEmailError(): boolean {
    const control = this.emailForm.get('email');
    return !!(control?.invalid && control?.touched);
  }

}
