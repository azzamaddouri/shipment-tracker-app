import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const publicGuard: CanActivateFn = () => {
 const authService = inject(AuthService);
 const router = inject(Router);

 if(!authService.isAuthenticated()) return true;

 if (authService.isOperator()) return router.createUrlTree(['/operator']);
 if (authService.isCarrier()) return router.createUrlTree(['/carrier']);

  return router.createUrlTree(['/']);
 
};
