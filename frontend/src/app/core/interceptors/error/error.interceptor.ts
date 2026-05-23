import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error : HttpErrorResponse) => {
      if (error.status===401) {
        authService.logout(),
        router.navigate(['/login'],{
          queryParams: {reason:'session_expired'}
        });
      }

      if(error.status === 403){
        if(authService.isOperator()) router.navigate(['/operator']);
        else if (authService.isCarrier()) router.navigate(['/carrier']);
        else router.navigate(['/']);

      }
      return throwError(()=>error);
    })
  )
};
