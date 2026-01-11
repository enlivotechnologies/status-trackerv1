import { DashboardStats } from '../../types';

interface AgentStatisticsProps {
  stats: DashboardStats | null;
}

const AgentStatistics = ({ stats }: AgentStatisticsProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Agent Statistics</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Total Agents */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Total Agents</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.totalAgents || 0}</div>
        </div>

        {/* Total Leads Generated */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Leads Generated</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.totalLeadsGenerated || 0}</div>
        </div>

        {/* Average Leads Per Agent */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Avg Leads/Agent</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.averageLeadsPerAgent?.toFixed(1) || '0.0'}</div>
        </div>

        {/* Leads Created Today */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Leads Today</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.leadsCreatedToday || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default AgentStatistics;
