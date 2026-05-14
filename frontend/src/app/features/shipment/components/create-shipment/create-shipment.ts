import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, output, signal } from '@angular/core';
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

  readonly created = output<void>()
  

  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  readonly shipmentService = inject(ShipmentService);

  readonly shipmentForm :FormGroup = this.fb.nonNullable.group({
    origin: ['', [Validators.required, Validators.minLength(3)]],
    destination: ['', [Validators.required, Validators.minLength(3)]],
    estimatedDelivery: ['']
  });


  createShipment() : void {
    if (this.shipmentForm.invalid) {
      this.shipmentForm.markAllAsTouched();
      return;
    }
    
    this.shipmentService.createShipment(this.shipmentForm.getRawValue() as CreateShipmentDto)
    .subscribe({
      next: () => { this.shipmentForm.reset(); this.created.emit(); },
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
