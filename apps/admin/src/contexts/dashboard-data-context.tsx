"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { useAuth } from "./use-auth";

export interface AdminFormResponse {
  id: string;
  serialNo: string;
  vesselName: string;
  activityType: string;
  status: string;
  createdAt: string;
  pilot: { email: string; name: string | null };
}

export interface PilotAccount {
  id: string;
  email: string;
  name: string | null;
  status: string;
}

type ResourceKey = "allForms" | "pilots";

interface CacheEntry<T> {
  data: T | null;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  lastFetchedAt: number | null;
}

type CacheState = Record<ResourceKey, CacheEntry<unknown>>;

type CacheAction =
  | { type: "FETCH_START"; key: ResourceKey }
  | { type: "FETCH_SUCCESS"; key: ResourceKey; data: unknown }
  | { type: "FETCH_ERROR"; key: ResourceKey; error: string }
  | { type: "INVALIDATE"; key: ResourceKey };

const initialEntry: CacheEntry<unknown> = {
  data: null,
  status: "idle",
  error: null,
  lastFetchedAt: null,
};

const initialState: CacheState = {
  allForms: { ...initialEntry },
  pilots: { ...initialEntry },
};

function cacheReducer(state: CacheState, action: CacheAction): CacheState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, [action.key]: { ...state[action.key], status: "loading", error: null } };
    case "FETCH_SUCCESS":
      return {
        ...state,
        [action.key]: { data: action.data, status: "success", error: null, lastFetchedAt: Date.now() },
      };
    case "FETCH_ERROR":
      return { ...state, [action.key]: { ...state[action.key], status: "error", error: action.error } };
    case "INVALIDATE":
      return { ...state, [action.key]: { ...state[action.key], status: "idle" } };
    default:
      return state;
  }
}

export interface DashboardDataContextType {
  allForms: CacheEntry<AdminFormResponse[]>;
  pilots: CacheEntry<PilotAccount[]>;
  ensureAllForms: () => Promise<void>;
  ensurePilots: () => Promise<void>;
  /** Refreshes forms and pilots together — wire to a global Refresh button. */
  refreshData: () => Promise<void>;
  refreshForms: () => Promise<void>;
  refreshPilots: () => Promise<void>;
  invalidateAllForms: () => void;
  invalidatePilots: () => void;
}

export const DashboardDataContext = createContext<DashboardDataContextType | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const { apiClient } = useAuth();
  const [state, dispatch] = useReducer(cacheReducer, initialState);

  const fetchAllForms = useCallback(async () => {
    dispatch({ type: "FETCH_START", key: "allForms" });
    try {
      const response = await apiClient.get("/api/forms");
      const data: AdminFormResponse[] = response.data.success ? response.data.data : [];
      dispatch({ type: "FETCH_SUCCESS", key: "allForms", data });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        key: "allForms",
        error: err instanceof Error ? err.message : "Failed to fetch forms",
      });
    }
  }, [apiClient]);

  const fetchPilots = useCallback(async () => {
    dispatch({ type: "FETCH_START", key: "pilots" });
    try {
      const response = await apiClient.get("/api/auth/pilots");
      const data: PilotAccount[] = response.data.success ? response.data.data : [];
      dispatch({ type: "FETCH_SUCCESS", key: "pilots", data });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        key: "pilots",
        error: err instanceof Error ? err.message : "Failed to fetch pilots",
      });
    }
  }, [apiClient]);

  const ensureAllForms = useCallback(async () => {
    if (state.allForms.status === "success" || state.allForms.status === "loading") return;
    await fetchAllForms();
  }, [state.allForms.status, fetchAllForms]);

  const ensurePilots = useCallback(async () => {
    if (state.pilots.status === "success" || state.pilots.status === "loading") return;
    await fetchPilots();
  }, [state.pilots.status, fetchPilots]);

  const refreshForms = useCallback(() => fetchAllForms(), [fetchAllForms]);
  const refreshPilots = useCallback(() => fetchPilots(), [fetchPilots]);
  const refreshData = useCallback(async () => {
    await Promise.all([fetchAllForms(), fetchPilots()]);
  }, [fetchAllForms, fetchPilots]);

  const invalidateAllForms = useCallback(() => dispatch({ type: "INVALIDATE", key: "allForms" }), []);
  const invalidatePilots = useCallback(() => dispatch({ type: "INVALIDATE", key: "pilots" }), []);

  const value = useMemo<DashboardDataContextType>(
    () => ({
      allForms: state.allForms as CacheEntry<AdminFormResponse[]>,
      pilots: state.pilots as CacheEntry<PilotAccount[]>,
      ensureAllForms,
      ensurePilots,
      refreshData,
      refreshForms,
      refreshPilots,
      invalidateAllForms,
      invalidatePilots,
    }),
    [state, ensureAllForms, ensurePilots, refreshData, refreshForms, refreshPilots, invalidateAllForms, invalidatePilots]
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}
