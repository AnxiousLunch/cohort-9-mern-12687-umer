export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
  msg?: string;
}
