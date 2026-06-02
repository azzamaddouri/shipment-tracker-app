import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CarrierService } from '../../../core/services/carrier.service';
import { AuthService, STATUS_LABELS, SHIPMENT_STATUS, ShipmentStatus } from '../../../core';
import { AllowedCarrierStatus, CarrierShipment } from '../../../core/models/carrier-shipment.model';
@Component({
  selector: 'app-carrier-dashboard',
  imports:     [DatePipe, ReactiveFormsModule],
  templateUrl: './carrier-dashboard.component.html',
  styleUrl: './carrier-dashboard.component.css',
})
export class CarrierDashboardComponent implements OnInit {
  readonly carrierService = inject(CarrierService);
  private readonly authService    = inject(AuthService);
  private readonly fb             = inject(FormBuilder);
  private readonly destroyRef     = takeUntilDestroyed();

  // ── Service signals ────────────────────────────────────────────────────
  readonly shipments       = this.carrierService.shipments;
  readonly todayDeliveries = this.carrierService.todayDeliveries;
  readonly completedToday  = this.carrierService.completedToday;
  readonly activeShipment  = this.carrierService.activeShipment;
  readonly loading         = this.carrierService.loading;
  readonly updating        = this.carrierService.updating;
  readonly error           = this.carrierService.error;
  readonly gpsState        = this.carrierService.gpsState;
  readonly gpsError        = this.carrierService.gpsError;
  readonly isBroadcasting  = this.carrierService.isBroadcasting;
  readonly broadcastingId  = this.carrierService.broadcastingId;

  // ── Auth ───────────────────────────────────────────────────────────────
  readonly currentUser = this.authService.user;

  // ── UI state ───────────────────────────────────────────────────────────
  readonly showStatusSheet   = signal(false);
  readonly showManualInput   = signal(false);
  readonly updateSuccess     = signal<string | null>(null);

  // ── Forms ──────────────────────────────────────────────────────────────
  readonly manualLocationForm = this.fb.group({
    location: this.fb.nonNullable.control('', Validators.required),
  });

  // ── Constants ──────────────────────────────────────────────────────────
  readonly STATUS_LABELS   = STATUS_LABELS;
  readonly SHIPMENT_STATUS = SHIPMENT_STATUS;

  // Allowed transitions a carrier can make
  readonly CARRIER_TRANSITIONS: Record<string, AllowedCarrierStatus[]> = {
    ORDER_PLACED:     ['PICKED_UP'],
    PROCESSING:       ['PICKED_UP'],
    PICKED_UP:        ['IN_TRANSIT'],
    IN_TRANSIT:       ['OUT_FOR_DELIVERY'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'EXCEPTION'],
    DELIVERED:        [],
    EXCEPTION:        ['IN_TRANSIT', 'OUT_FOR_DELIVERY'],
  };

  readonly STATUS_CONFIG: Record<ShipmentStatus, { bg: string; text: string; dot: string; border: string }> = {
    [SHIPMENT_STATUS.ORDER_PLACED]:     { bg:'bg-blue-50',   text:'text-blue-700',   dot:'bg-blue-500',   border:'border-blue-200'   },
    [SHIPMENT_STATUS.PROCESSING]:       { bg:'bg-amber-50',  text:'text-amber-700',  dot:'bg-amber-500',  border:'border-amber-200'  },
    [SHIPMENT_STATUS.PICKED_UP]:        { bg:'bg-purple-50', text:'text-purple-700', dot:'bg-purple-500', border:'border-purple-200' },
    [SHIPMENT_STATUS.IN_TRANSIT]:       { bg:'bg-cyan-50',   text:'text-cyan-700',   dot:'bg-cyan-500',   border:'border-cyan-200'   },
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: { bg:'bg-yellow-50', text:'text-yellow-700', dot:'bg-yellow-500', border:'border-yellow-200' },
    [SHIPMENT_STATUS.DELIVERED]:        { bg:'bg-green-50',  text:'text-green-700',  dot:'bg-green-500',  border:'border-green-200'  },
    [SHIPMENT_STATUS.EXCEPTION]:        { bg:'bg-red-50',    text:'text-red-700',    dot:'bg-red-500',    border:'border-red-200'    },
  };

  // Stats
  readonly stats = computed(() => ({
    total:     this.shipments().length,
    active:    this.todayDeliveries().length,
    delivered: this.completedToday().filter(s => s.status === 'DELIVERED').length,
    exception: this.completedToday().filter(s => s.status === 'EXCEPTION').length,
  }));

  readonly allowedNextStatuses = computed(() => {
    const s = this.activeShipment();
    if (!s) return [];
    return this.CARRIER_TRANSITIONS[s.status] ?? [];
  });

  ngOnInit(): void {
    this.carrierService.loadMyDeliveries();
  }

  selectShipment(shipment: CarrierShipment): void {
    this.carrierService.selectShipment(shipment);
    this.showStatusSheet.set(true);
    this.showManualInput.set(false);
    this.updateSuccess.set(null);
  }

  closeSheet(): void {
    this.showStatusSheet.set(false);
    this.showManualInput.set(false);
    this.carrierService.selectShipment(null);
  }

  applyStatus(newStatus: AllowedCarrierStatus): void {
    const s = this.activeShipment();
    if (!s) return;

    this.carrierService.updateStatus(s.id, {
      status:          newStatus,
      currentLocation: s.currentLocation ?? '',
    }).pipe(this.destroyRef).subscribe(() => {
      this.updateSuccess.set(`Status updated to ${STATUS_LABELS[newStatus]}`);
      setTimeout(() => this.updateSuccess.set(null), 3000);
    });
  }

  toggleBroadcast(shipment: CarrierShipment): void {
    if (this.broadcastingId() === shipment.id) {
      this.carrierService.stopBroadcasting();
    } else {
      this.carrierService.startBroadcasting(shipment.id, shipment.trackingNumber);
      this.showManualInput.set(false);
    }
  }

  submitManualLocation(): void {
    if (this.manualLocationForm.invalid || !this.activeShipment()) return;
    const label        = this.manualLocationForm.getRawValue().location;
    const trackingNumber = this.activeShipment()!.trackingNumber;

    this.carrierService.pushManualLocation(trackingNumber, label)
      .pipe(this.destroyRef)
      .subscribe(() => {
        this.manualLocationForm.reset();
        this.showManualInput.set(false);
        this.updateSuccess.set(`Location "${label}" pushed`);
        setTimeout(() => this.updateSuccess.set(null), 3000);
      });
  }

  getStatusConfig(status: ShipmentStatus) {
    return this.STATUS_CONFIG[status] ?? this.STATUS_CONFIG[SHIPMENT_STATUS.ORDER_PLACED];
  }

  readonly today = signal(
  new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })
);

readonly greeting = signal(
  new Date().getHours() < 12 ? 'morning'
  : new Date().getHours() < 17 ? 'afternoon'
  : 'evening'
);
}