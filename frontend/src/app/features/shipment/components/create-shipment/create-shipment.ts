import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateShipmentDto, ShipmentService,  } from '../../../../core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-shipment',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-shipment.html',
  styleUrl: './create-shipment.css',
})
export class CreateShipment {

  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private readonly shipmentService = inject(ShipmentService);

  shipmentForm :FormGroup = this.fb.group({
    origin: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    destination: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    estimatedDelivery: this.fb.nonNullable.control('')
  });

  isSuccess = signal(false);

  isSubmitting = this.shipmentService.loading;
  errorMessage = this.shipmentService.error;



  createShipment() : void {
    if (this.shipmentForm.invalid) {
      this.shipmentForm.markAllAsTouched();
      return;
    }
    
    const shipment : CreateShipmentDto = this.shipmentForm.getRawValue();

    this.shipmentService.createShipment(shipment)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.shipmentForm.reset();
        setTimeout(() => {
          this.isSuccess.set(false);
        }, 3000);
      },
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
