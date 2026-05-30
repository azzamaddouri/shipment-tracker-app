import { AuthUser, JwtPayload } from "../../models/user.model";

export class JwtHelper {

    static decode(token:string):JwtPayload | null{
        try {
           const parts = token.split('.');
           if(parts.length !==3 ) return null;

           const payload = parts[1];

            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const json   = decodeURIComponent(
                atob(base64)
                .split('')
                .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
            );
    
            return JSON.parse(json) as JwtPayload;

        } catch  {
            return null;
        }
    }


    static isExpired(token:string):boolean{
        const payload = JwtHelper.decode(token);
        if(!payload) return true;
        return Date.now() >= payload.exp * 1000;
    }


    static expiresInMs(token:string): number {
       const payload = JwtHelper.decode(token);
       if (!payload) return 0;
       return Math.max(0, payload.exp * 1000 - Date.now());
    }

}