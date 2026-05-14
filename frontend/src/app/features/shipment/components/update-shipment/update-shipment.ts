import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {  SHIPMENT_STATUS, STATUS_LABELS, ShipmentService, UpdateStatusDto } from '../../../../core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-shipment',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './update-shipment.html',
  styleUrl: './update-shipment.css',
})
export class UpdateShipment implements OnInit {

  private fb = inject(FormBuilder);
  readonly shipmentService = inject(ShipmentService);


  readonly shipments = this.shipmentService.shipments;

  updateForm = this.fb.group({
    shipmentId: [null, Validators.required],
    status: [SHIPMENT_STATUS.PROCESSING, Validators.required],
    currentLocation: [''],
  });

  STATUS_LABELS = STATUS_LABELS;
  statusOptions = Object.values(SHIPMENT_STATUS);


  ngOnInit(): void {
  this.shipmentService.loadAll();
 }


  updateShipment() : void  {
    if (this.updateForm.invalid || this.shipmentService.loading()) {
      this.updateForm.markAllAsTouched();
      return;
    }


    const { shipmentId, status, currentLocation } = this.updateForm.getRawValue();
    
    this.shipmentService.updateShipmentStatus(shipmentId!, { status, currentLocation } as UpdateStatusDto)
    .subscribe((shipment) => {
      if (shipment !== null) {
        this.updateForm.reset({
          shipmentId: null,
          status: SHIPMENT_STATUS.PROCESSING,
          currentLocation: '',
        });}
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
