import { useState } from 'react';
import AdminDashboardHeader from '../../components/admin/AdminDashboardHeader';
import AgentStatistics from '../../components/admin/AgentStatistics';
import AgentOverviewTable, { AgentOverview } from '../../components/admin/AgentOverviewTable';
import AgentOverviewModal from '../../components/admin/AgentOverviewModal';
import { useAdminDashboardData } from '../../components/admin/hooks/useAdminDashboardData';

const AdminDashboard = () => {
  const { stats, agentOverview, isLoading } = useAdminDashboardData();
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentOverview | null>(null);

  const handleOpenOverview = (agent: AgentOverview) => {
    setSelectedAgent(agent);
    setIsOverviewModalOpen(true);
  };

  const handleCloseOverview = () => {
    setIsOverviewModalOpen(false);
    setSelectedAgent(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      <AdminDashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <AgentStatistics stats={stats} />

        {/* Coordinator Performance Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Coordinator Performance</h2>
          <AgentOverviewTable agents={agentOverview} onOpenOverview={handleOpenOverview} />
        </div>
      </main>

      <AgentOverviewModal
        isOpen={isOverviewModalOpen}
        agent={selectedAgent}
        onClose={handleCloseOverview}
      />
    </div>
  );
};

export default AdminDashboard;
