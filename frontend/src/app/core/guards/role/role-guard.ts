import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Role } from '../../models/user.model';

export const roleGuard = (...roles: Role[]): CanActivateFn =>
   () => {

    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    if(authService.hasRole(...roles)) return true;

    // Authenticated but wrong role — redirect to their own home
    if (authService.isOperator()) return router.createUrlTree(['/operator']);
    if (authService.isCarrier()) return router.createUrlTree(['/carrier']);

  return router.createUrlTree(['/']);
};
