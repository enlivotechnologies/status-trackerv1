import { DashboardStats } from '../../types';

interface AgentStatisticsProps {
  stats: DashboardStats | null;
}

const AgentStatistics = ({ stats }: AgentStatisticsProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Coordinator Statistics</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Total Coordinators */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Total Coordinators</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.totalAgents || 0}</div>
        </div>

        {/* Total Colleges */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Total Colleges</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.totalLeadsGenerated || 0}</div>
        </div>

        {/* Average Colleges Per Coordinator */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Avg Colleges/Coordinator</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.averageLeadsPerAgent?.toFixed(1) || '0.0'}</div>
        </div>

        {/* Colleges Added Today */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Colleges Today</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.leadsCreatedToday || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default AgentStatistics;
