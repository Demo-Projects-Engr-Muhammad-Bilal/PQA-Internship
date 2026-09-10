"use client";

import { useContext } from "react";
import { AuthContext, type AuthContextType } from "./auth-context-core";

/** Reads the current auth state and actions. Must be used inside an `<AuthProvider>`. */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
