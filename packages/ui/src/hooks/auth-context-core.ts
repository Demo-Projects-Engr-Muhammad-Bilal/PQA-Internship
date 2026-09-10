import { createContext } from "react";
import type { AxiosInstance } from "axios";

export type Portal = "admin" | "pilot";

export interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, loginPortal: Portal) => Promise<void>;
  logout: () => void;
  apiClient: AxiosInstance;
  error?: string | null;
  clearError?: () => void;
  refreshUser?: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
