import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AuthService,
  PublicShipmentActivity,
  SHIPMENT_STATUS,
  ShipmentService,
  ShipmentStatus,
  STATUS_LABELS,
} from '../../../core';
import { LoginRequest } from '../../../core/models/user.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink,DatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly shipmentService = inject(ShipmentService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.authService.loading;
  readonly error = this.authService.error;

  readonly loginForm = this.fb.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(16),
    ]),
  });

  readonly showPassword = signal(false);
  readonly recentActivity = signal<PublicShipmentActivity[]>([]);
  readonly activityLoading = signal(true);

  readonly STATUS_LABELS = STATUS_LABELS;

  readonly STATUS_DOT_CLASS_MAP: Record<ShipmentStatus, string> = {
    [SHIPMENT_STATUS.ORDER_PLACED]:      'bg-blue-500',
  [SHIPMENT_STATUS.PROCESSING]:        'bg-amber-500',
  [SHIPMENT_STATUS.PICKED_UP]:         'bg-purple-500',
  [SHIPMENT_STATUS.IN_TRANSIT]:        'bg-cyan-500',
  [SHIPMENT_STATUS.OUT_FOR_DELIVERY]:  'bg-yellow-500',
  [SHIPMENT_STATUS.DELIVERED]:         'bg-green-500',
  [SHIPMENT_STATUS.EXCEPTION]:         'bg-red-500',
  };

  private readonly ROLE_REDIRECT: Record<string, string> = {
    OPERATOR: '/operator',
    CARRIER: '/carrier',
    CUSTOMER: '/',
  };

  constructor() {
    this.shipmentService
      .getRecentPublicActivity()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (activity) => {
          this.recentActivity.set(activity);
          this.activityLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load recent activity', err);
          this.activityLoading.set(false);
        },
      });
  }

  getStatusDotClass(status: ShipmentStatus): string {
    return this.STATUS_DOT_CLASS_MAP[status];
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.authService
      .login(this.loginForm.getRawValue() as LoginRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const role = this.authService.role();
          const redirect = role ? (this.ROLE_REDIRECT[role] ?? '/') : '/';
          this.router.navigateByUrl(redirect);
        },
      });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('email')) return 'Enter a valid email address';
    if (field?.hasError('minlength'))
      return `Minimum length is ${field.errors?.['minlength'].requiredLength} characters`;
    return '';
  }
}
