import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { PLATFORM_CONFIG } from '../../../core/config/platform.config';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent { 
  
  readonly platformConfig = PLATFORM_CONFIG;
  
  private readonly fb = inject(FormBuilder);
  readonly searchForm = this.fb.group({
    trackingNumber: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  readonly searchError = signal('');
  private readonly router      = inject(Router);

  year = signal(new Date().getFullYear());

  search(): void {

    const ctrl = this.searchForm.get('trackingNumber');
    const val  = this.searchForm.getRawValue().trackingNumber.trim().toUpperCase();

    if (!val) {
      this.searchError.set('Please enter a tracking number.');
      ctrl?.markAsTouched();
      return;
    }
    if (val.length < 3) {
      this.searchError.set('Tracking number must be at least 3 characters.');
      ctrl?.markAsTouched();
      return;
    }

    this.searchError.set('');
    this.router.navigate(['/track', val]);
  }

  clearError(): void {
    this.searchError.set('');
  }
}
