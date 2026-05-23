import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthResponse, AuthUser, LoginRequest, Role } from '../../models/user.model';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { TokenService } from '../token/token.service';
import { Router } from '@angular/router';

const AUTH_BASE = `${environment.api.server}/auth`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUser|null>(
    this.tokenService.getUser());


  readonly isAuthenticated = computed(()=> this._user !== null)
  readonly role = computed(()=> this._user()?.role ?? null)
  readonly isOperator = computed(()=>this._user()?.role === 'OPERATOR');
  readonly isCarrier = computed(()=>this._user()?.role === 'CARRIER');
  readonly isCustomer = computed(() => this._user()?.role === 'CUSTOMER');

  constructor(){
    if (this.tokenService.isValid()) {
       this._scheduleAutoLogout();
    }
  }

  login(request:LoginRequest){
    return this.http
    .post<AuthResponse>(`${AUTH_BASE}/login`,request)
    .pipe(
      tap(({token}) =>{
        this.tokenService.save(token);
        this._user.set(this.tokenService.getUser());
        this._scheduleAutoLogout();
      }
      )
    );
  }
   
  logout():void{
    this.tokenService.remove();
    this._user.set(null);
    this._clearAutoLogout();
    this.router.navigate(['/login']);

  }

  hasRole(...roles:Role[]):boolean{
    const current  = this.role();
    return current !== null && roles.includes(current);
  }
  
  private _logoutTimer : ReturnType<typeof setTimeout> | null = null;

  private _scheduleAutoLogout() : void {
    this._clearAutoLogout();
    const ms = this.tokenService.expiresInMs();
    if(ms <= 0){ this.logout(); return;}
    this._logoutTimer = setTimeout(() => this.logout(),ms)
  }

  private _clearAutoLogout() {
    if(this._logoutTimer !== null){
      clearTimeout(this._logoutTimer);
      this._logoutTimer=null;
    }
  }

  getToken():string | null{
    return this.tokenService.get();
  }
 
}
