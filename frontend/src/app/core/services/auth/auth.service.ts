import { Injectable } from '@angular/core';
import { Role } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  isAuthenticated(): boolean{
  return true;
  }

  isOperator():boolean{
    return true;
  }

  isCarrier():boolean{
    return true;
  }

  hasRole(...roles:Role[]):boolean{
    return true;
  }
}
