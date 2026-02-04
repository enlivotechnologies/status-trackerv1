import { useState } from "react";
import AdminDashboardHeader from "../../components/admin/AdminDashboardHeader";
import AgentStatistics from "../../components/admin/AgentStatistics";
import AgentOverviewTable, {
  AgentOverview,
} from "../../components/admin/AgentOverviewTable";
import AgentOverviewModal from "../../components/admin/AgentOverviewModal";
import { useAdminDashboardData } from "../../components/admin/hooks/useAdminDashboardData";

const AdminDashboard = () => {
  const { stats, agentOverview, isLoading } = useAdminDashboardData();
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentOverview | null>(
    null,
  );

  const handleOpenOverview = (agent: AgentOverview) => {
    setSelectedAgent(agent);
    setIsOverviewModalOpen(true);
  };

  const handleCloseOverview = () => {
    setIsOverviewModalOpen(false);
    setSelectedAgent(null);
  };

  const isInitialLoading = isLoading && !stats && agentOverview.length === 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F6" }}>
      <AdminDashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {isInitialLoading ? (
          <div className="mb-8">
            <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-4" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl shadow-sm p-4 border border-black/10 bg-white"
                >
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <AgentStatistics stats={stats} />
        )}

        {/* Coordinator Performance Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">
            Coordinator Performance
          </h2>
          {isInitialLoading ? (
            <div className="rounded-xl shadow-sm border border-gray-200/60 overflow-hidden bg-white">
              <div className="px-6 py-4 border-b border-gray-200/60 bg-gray-50">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-64 bg-gray-200 rounded animate-pulse mt-2" />
              </div>
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-10 bg-gray-100 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : (
            <AgentOverviewTable
              agents={agentOverview}
              onOpenOverview={handleOpenOverview}
            />
          )}
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
