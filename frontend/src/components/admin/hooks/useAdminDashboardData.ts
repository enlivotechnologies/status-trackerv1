import { useState, useEffect } from "react";
import { dashboardAPI } from "../../../services/api";
import { DashboardStats } from "../../../types";
import { AgentOverview } from "../AgentOverviewTable";

const CACHE_KEY = "adminDashboardCache:v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useAdminDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agentOverview, setAgentOverview] = useState<AgentOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    return dashboardAPI.getStats();
  };

  const fetchAgentOverview = async () => {
    return dashboardAPI.getAgentOverview();
  };

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return false;
      const parsed = JSON.parse(cached) as {
        timestamp: number;
        stats: DashboardStats | null;
        agentOverview: AgentOverview[];
      };
      if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return false;
      setStats(parsed.stats);
      setAgentOverview(parsed.agentOverview || []);
      setIsLoading(false);
      return true;
    } catch {
      return false;
    }
  };

  const refreshData = async (showLoader: boolean) => {
    try {
      if (showLoader) setIsLoading(true);
      const [statsData, overviewData] = await Promise.all([
        fetchStats(),
        fetchAgentOverview(),
      ]);
      setStats(statsData);
      setAgentOverview(overviewData);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          stats: statsData,
          agentOverview: overviewData,
        }),
      );
    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasCache = loadFromCache();
    refreshData(!hasCache);
  }, []);

  return {
    stats,
    agentOverview,
    isLoading,
    fetchStats,
    fetchAgentOverview,
  };
};
