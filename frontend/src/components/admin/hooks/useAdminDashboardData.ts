import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../../services/api';
import { DashboardStats } from '../../../types';
import { AgentOverview } from '../AgentOverviewTable';

export const useAdminDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agentOverview, setAgentOverview] = useState<AgentOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgentOverview = async () => {
    try {
      const data = await dashboardAPI.getAgentOverview();
      setAgentOverview(data);
    } catch (error) {
      console.error('Failed to fetch agent overview:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAgentOverview();
  }, []);

  return {
    stats,
    agentOverview,
    isLoading,
    fetchStats,
    fetchAgentOverview
  };
};
