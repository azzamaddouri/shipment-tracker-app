import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthResponse, AuthUser, LoginRequest, Role } from '../../models/user.model';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { TokenService } from '../token/token.service';
import { Router } from '@angular/router';

const AUTH_BASE = `${environment.api.server}/auth`;

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  private readonly _state = signal<AuthState>({ 
    ...initialAuthState,
    user: this.tokenService.getUser() });

  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly isAuthenticated = computed(()=> this._state().user !== null)
  readonly role = computed(()=> this._state().user?.role ?? null)
  readonly isOperator = computed(()=>this._state().user?.role === 'OPERATOR');
  readonly isCarrier = computed(()=>this._state().user?.role === 'CARRIER');
  readonly isCustomer = computed(() => this._state().user?.role === 'CUSTOMER');

  constructor(){
    if (this.tokenService.isValid()) {
       this._scheduleAutoLogout();
    }
  }

  login(request:LoginRequest){
        this._patchState({ loading: true, error: null });

    return this.http
    .post<AuthResponse>(`${AUTH_BASE}/login`,request)
    .pipe(
      tap(({token}) =>{
        this.tokenService.save(token);
        this._patchState({
          user:    this.tokenService.getUser(),
          loading: false,
          error:   null,
        });
        this._scheduleAutoLogout();
      }),
      catchError((err)=>{
        this._patchState({
          loading: false,  
          error:   err.error?.message ?? 'Login failed.',
        });
       return throwError(() => err);
      })
    );
  }
   
  logout():void{
    this.tokenService.remove();
    this._state.set(initialAuthState);
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
  
  private _patchState(patch: Partial<AuthState>): void {
    this._state.update(state => ({ ...state, ...patch }));
  }
}
