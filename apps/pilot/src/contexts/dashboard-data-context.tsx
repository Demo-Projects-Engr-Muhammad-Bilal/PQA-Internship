"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { useAuth } from "@repo/ui";

export interface PilotFormResponse {
  id: string;
  serialNo: string;
  vesselName: string;
  activityType: string;
  activityDateTime: string;
  status: string;
}

type ResourceKey = "myForms";

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
  myForms: { ...initialEntry },
};

function cacheReducer(state: CacheState, action: CacheAction): CacheState {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        [action.key]: { ...state[action.key], status: "loading", error: null },
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        [action.key]: {
          data: action.data,
          status: "success",
          error: null,
          lastFetchedAt: Date.now(),
        },
      };
    case "FETCH_ERROR":
      return {
        ...state,
        [action.key]: { ...state[action.key], status: "error", error: action.error },
      };
    case "INVALIDATE":
      // Keep stale data visible (avoid UI flash) but mark it idle so the
      // next consumer triggers a real re-fetch instead of trusting the cache.
      return {
        ...state,
        [action.key]: { ...state[action.key], status: "idle" },
      };
    default:
      return state;
  }
}

export interface DashboardDataContextType {
  myForms: CacheEntry<PilotFormResponse[]>;
  /** Fetches "my forms" only if not already cached (or previously invalidated). */
  ensureMyForms: () => Promise<void>;
  /** Force a network re-fetch of "my forms", bypassing the cache. Wire to a Refresh button. */
  refreshData: () => Promise<void>;
  /** Marks the cache stale without fetching — call after a mutation so the NEXT read re-fetches. */
  invalidateMyForms: () => void;
}

export const DashboardDataContext = createContext<DashboardDataContextType | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const { apiClient } = useAuth();
  const [state, dispatch] = useReducer(cacheReducer, initialState);

  const fetchMyForms = useCallback(async () => {
    dispatch({ type: "FETCH_START", key: "myForms" });
    try {
      const response = await apiClient.get("/forms");
      const data: PilotFormResponse[] = response.data.success ? response.data.data : [];
      dispatch({ type: "FETCH_SUCCESS", key: "myForms", data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch forms";
      dispatch({ type: "FETCH_ERROR", key: "myForms", error: message });
    }
  }, [apiClient]);

  const ensureMyForms = useCallback(async () => {
    // Cache hit: idle-but-never-fetched or currently loading are the only
    // states that should trigger a network call; "success" reuses cache.
    if (state.myForms.status === "success" || state.myForms.status === "loading") {
      return;
    }
    await fetchMyForms();
  }, [state.myForms.status, fetchMyForms]);

  const refreshData = useCallback(async () => {
    await fetchMyForms();
  }, [fetchMyForms]);

  const invalidateMyForms = useCallback(() => {
    dispatch({ type: "INVALIDATE", key: "myForms" });
  }, []);

  const value = useMemo<DashboardDataContextType>(
    () => ({
      myForms: state.myForms as CacheEntry<PilotFormResponse[]>,
      ensureMyForms,
      refreshData,
      invalidateMyForms,
    }),
    [state.myForms, ensureMyForms, refreshData, invalidateMyForms]
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}
