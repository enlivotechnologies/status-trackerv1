import { useState, useEffect } from 'react';
import { dashboardAPI, leadsAPI, worksAPI } from '../../../services/api';
import { DashboardStats, Lead } from '../../../types';

interface NewsItem {
  type: 'note' | 'pending_work' | 'pending';
  leadName: string;
  message: string;
  time: string;
  lead?: Lead;
  work?: any;
  note?: any;
  timestamp?: number;
  priority?: 'critical' | 'high' | 'normal';
  isFromYesterday?: boolean;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [importantNews, setImportantNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsData, allLeads, allPendingWorks, pendingWorksFromYesterday] = await Promise.all([
        dashboardAPI.getStats(),
        leadsAPI.getLeads(),
        worksAPI.getWorks().catch(() => []),
        worksAPI.getPendingWorksFromYesterday().catch(() => [])
      ]);
      
      console.log('Dashboard stats received:', statsData);
      console.log('Pending works count from API:', statsData?.pendingWorks);
      
      setStats(statsData);
      
      // Get today's leads (created today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todaysLeads = allLeads
        .filter(lead => {
          const leadDate = new Date(lead.createdAt || '');
          return leadDate >= today && leadDate < tomorrow;
        })
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setRecentLeads(todaysLeads);

      // Generate important news
      const news: NewsItem[] = [];
      
      // Count pending works from previous days
      let pendingWorksCount = 0;
      if (pendingWorksFromYesterday && Array.isArray(pendingWorksFromYesterday)) {
        pendingWorksCount = pendingWorksFromYesterday.length;
      }
      
      // Add a single reminder message if there are pending works
      if (pendingWorksCount > 0) {
        news.push({
          type: 'pending_work',
          leadName: 'Reminder',
          message: `There ${pendingWorksCount === 1 ? 'is' : 'are'} ${pendingWorksCount} pending work${pendingWorksCount > 1 ? 's' : ''} from previous day${pendingWorksCount > 1 ? 's' : ''}. Complete them.`,
          time: '',
          timestamp: Date.now(),
          priority: 'critical'
        });
      }
      
      // Add notes that users have added (only most recent note per lead)
      const leadsWithNotes = new Set<string>();
      for (const lead of allLeads) {
        if (lead.notes && lead.notes.length > 0 && !leadsWithNotes.has(lead.id)) {
          const latestNote = lead.notes[0];
          // Get the most recent note content, keep it concise
          const noteContent = latestNote.content.trim();
          leadsWithNotes.add(lead.id);
          
          news.push({
            type: 'note',
            leadName: lead.name,
            message: noteContent,
            time: new Date(latestNote.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
            lead: lead,
            note: latestNote,
            timestamp: new Date(latestNote.createdAt).getTime(),
            priority: 'normal'
          });
        }
      }

      // Sort by priority then by timestamp
      // The reminder (pending_work with critical priority) should appear first
      const sortedNews = news
        .sort((a, b) => {
          const priorityOrder: any = { 'critical': 3, 'high': 2, 'normal': 1 };
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          
          return (b.timestamp || 0) - (a.timestamp || 0);
        })
        .slice(0, 20);
      
      setImportantNews(sortedNews);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    recentLeads,
    importantNews,
    isLoading,
    fetchDashboardData,
    setRecentLeads,
    setStats
  };
};
