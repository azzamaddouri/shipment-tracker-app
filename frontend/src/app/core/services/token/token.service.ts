import { Injectable } from '@angular/core';
import { AuthUser } from '../../models/user.model';
import { JwtHelper } from '../../helpers/auth/jwt.helper';

const TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  
  save(token:string):void{
    localStorage.setItem(TOKEN_KEY,token);
  }

  get():string | null{
    return localStorage.getItem(TOKEN_KEY);
  }

  remove(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isValid():boolean{
    const token = this.get();
    if (!token) return false;
    return !JwtHelper.isExpired(token);
  }

  getUser():AuthUser | null{
   const token = this.get();
   if(!token) return null;

   const payload = JwtHelper.decode(token);
   if(!payload) return null;

   if(JwtHelper.isExpired(token)){
    this.remove();
    return null;
   }
   return {
      id:    +payload.sub,
      email: payload.email,
      name:  payload.name,
      role:  payload.role,
    };
  }

  expiresInMs():number{
    const token = this.get();
    return token ? JwtHelper.expiresInMs(token) :0;
  }
 
}
