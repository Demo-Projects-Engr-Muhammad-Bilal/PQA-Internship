export type Role = "ADMIN" | "PILOT";

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
  };
  accessToken: string;
  refreshToken?: string;
}