export type Role = 'OPERATOR'| 'CARRIER' | 'CUSTOMER';

export interface AuthUser {
  id:       number;
  email:    string;
  name:     string;
  role:     Role;
}

export interface JwtPayload {
  sub:      string;   
  email:    string;
  name: string;
  role:     Role;
  iat:      number;
  exp:      number;
}

export interface LoginRequest{
    email: string,
    password:string
}

export interface AuthResponse{
    token:string
}