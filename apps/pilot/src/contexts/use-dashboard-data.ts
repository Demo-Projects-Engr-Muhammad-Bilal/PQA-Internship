"use client";

import { useContext } from "react";
import { DashboardDataContext, type DashboardDataContextType } from "./dashboard-data-context";

/** Reads cached dashboard data and cache-control actions. Must be used inside a `<DashboardDataProvider>`. */
export const useDashboardData = (): DashboardDataContextType => {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardDataProvider");
  }
  return context;
};
