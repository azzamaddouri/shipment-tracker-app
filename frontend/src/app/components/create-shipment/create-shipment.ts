import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateShipmentRequest } from '../../models/shipment.model';
import { ShipmentService } from '../../services/shipment/shipment-service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-create-shipment',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-shipment.html',
  styleUrl: './create-shipment.css',
})
export class CreateShipment {

  private fb = inject(FormBuilder);
  private shipmentService = inject(ShipmentService);

  shipmentForm :FormGroup = this.fb.group({
    origin: ['', [Validators.required, Validators.minLength(3)]],
    destination: ['', [Validators.required, Validators.minLength(3)]],
    estimatedDelivery: ['']
  });


  isSubmitting = signal(false);


  createShipment() : void {
    if (this.shipmentForm.invalid) {
      this.shipmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const shipement : CreateShipmentRequest = this.shipmentForm.value;

    this.shipmentService.createShipment(shipement)
    .pipe(catchError(() => {
      this.isSubmitting.set(false);
      return of(null);
    }))
    .subscribe(()=>{
      this.shipmentForm.reset();
      this.isSubmitting.set(false);
    });
  }


  hasError(fieldName: string): boolean {
    const field = this.shipmentForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.shipmentForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('minlength')) {
      return `Minimum length is ${field.errors?.['minlength'].requiredLength} characters`;
    }
    return '';
  }



}
