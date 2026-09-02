/**
 * Shape returned by GET /api/auth/pilots and POST /api/auth/pilots
 * Mirrors the `select` in AdminAuthService.createPilot / getAllPilots.
 */
export interface Pilot {
  id: string;
  name: string | null;
  email: string;
  role: "PILOT";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
