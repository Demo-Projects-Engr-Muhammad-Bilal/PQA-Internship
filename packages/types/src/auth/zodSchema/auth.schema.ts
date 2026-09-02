import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const adminRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Update Admin Profile (Self)
export const updateAdminProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().trim().toLowerCase().email("Invalid email address").optional(),
});

// Change Password (Self)
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Revoke Specific Session
export const revokeSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

// Pilot Management Schemas
export const createPilotSchema = z.object({
  name: z.string().trim().min(2, "Pilot name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(6, "Initial password must be at least 6 characters"),
});

export const adminResetPilotPasswordSchema = z.object({
  pilotId: z.string().min(1, "Pilot ID is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const togglePilotStatusSchema = z.object({
  pilotId: z.string().min(1, "Pilot ID is required"),
  isActive: z.boolean(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Inferred TypeScript Types
export type LoginInput = z.infer<typeof loginSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>;
export type CreatePilotInput = z.infer<typeof createPilotSchema>;
export type AdminResetPilotPasswordInput = z.infer<typeof adminResetPilotPasswordSchema>;
export type TogglePilotStatusInput = z.infer<typeof togglePilotStatusSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
