import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShipmentService } from '../../services/shipment-service';
import { Shipment, SHIPMENT_STATUS, STATUS_LABELS } from '../../models/shipment.model';
import { CommonModule } from '@angular/common';
import { catchError, of} from 'rxjs';

@Component({
  selector: 'app-update-shipment',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './update-shipment.html',
  styleUrl: './update-shipment.css',
})
export class UpdateShipment implements OnInit {

  private fb = inject(FormBuilder);
  private shipmentService = inject(ShipmentService);

  updateForm = this.fb.group({
    shipmentId: [null, Validators.required],
    status: [SHIPMENT_STATUS.PROCESSING, Validators.required],
    currentLocation: [''],
  });

  STATUS_LABELS = STATUS_LABELS;
  statusOptions = Object.values(SHIPMENT_STATUS);
  shipments = signal<Shipment[]>([]);
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  updateShipment() : void  {
    if (this.updateForm.invalid || this.isSubmitting()) {
      this.updateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { shipmentId, status, currentLocation } = this.updateForm.value;
    
    this.shipmentService.updateShipmentStatus(shipmentId!, { status, currentLocation })
    .pipe(
      catchError((error) => {
        this.errorMessage.set('Failed to update shipment status. Please try again later.');
        return of(null);
      }))
    .subscribe((shipment) => {
      if (shipment !== null) {
        this.updateForm.reset({
          shipmentId: null,
          status: SHIPMENT_STATUS.PROCESSING,
          currentLocation: '',
        });}
      this.isSubmitting.set(false);
    });
  }

 ngOnInit(): void {
   this.loadShipments();
 }

 loadShipments(): void {

  this.isLoading.set(true);
  this.errorMessage.set('');

  this.shipmentService.getAllShipments()
  .pipe(
    catchError((error) => {
      this.errorMessage.set('Failed to load shipments. Please try again later.');
      return of([]);
    }),)
  .subscribe((shipments) => {
    this.shipments.set(shipments);
    this.isLoading.set(false);
  });

  
 }
 onSelectShipmentId(): void {

  const shipmentId = this.updateForm.get('shipmentId')?.value;

  if(!shipmentId) return;

  const selectedShipment = this.shipments().find(s => s.id === shipmentId);

  if(selectedShipment) {
    this.updateForm.patchValue({
      currentLocation: selectedShipment.currentLocation || '',
    });
  }

 }

 hasError(fieldName: string): boolean {
    const field = this.updateForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.updateForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    return '';
  }

}
