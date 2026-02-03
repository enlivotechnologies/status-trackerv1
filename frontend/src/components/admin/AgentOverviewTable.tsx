interface AgentOverview {
  agentId: string;
  agentName: string;
  agentEmail: string;
  leadsToday: number;
  leadsWeek: number;
  leadsMonth: number;
  pending: number;
  completed: number;
  pendingWorks: number;
  // Performance metrics
  totalLeadsAssigned: number;
  overdueLeads: number;
  closedDeals: number;
  lostDeals: number;
  commissionClosed: number;
  commissionLost: number;
  inProgressCommission: number;
}

interface AgentOverviewTableProps {
  agents: AgentOverview[];
  onOpenOverview: (agent: AgentOverview) => void;
}

const AgentOverviewTable = ({ agents, onOpenOverview }: AgentOverviewTableProps) => {
  if (agents.length === 0) {
    return (
      <div className="rounded-xl shadow-sm border border-gray-200/60 overflow-hidden" style={{ backgroundColor: '#FEFDFB' }}>
        <div className="p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mt-4 text-sm text-gray-400">No coordinators found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-sm border border-gray-200/60 overflow-hidden" style={{ backgroundColor: '#FEFDFB' }}>
      <div className="px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-purple-50 to-purple-100/50">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Coordinator Overview</h3>
        <p className="text-xs text-gray-500 mt-1">College management performance by coordinator</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200/60 bg-gray-50/50">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Coordinator Name
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Total Colleges
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Overdue
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Seminars Done
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Pending
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, index) => {
              const hasOverdueLeads = agent.overdueLeads > 0;
              
              return (
                <tr 
                  key={agent.agentId} 
                  className={`border-b border-gray-100/50 transition-all duration-200 ${
                    index === agents.length - 1 ? 'border-b-0' : ''
                  } ${hasOverdueLeads ? 'bg-red-50/40' : 'hover:bg-gray-50/40'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                        hasOverdueLeads ? 'bg-red-500' : 'bg-purple-500'
                      }`}>
                        <span className="text-sm font-medium text-white">
                          {agent.agentName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{agent.agentName}</div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">{agent.agentEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-gray-900">{agent.totalLeadsAssigned}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hasOverdueLeads 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {agent.overdueLeads}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {agent.closedDeals}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      agent.pending > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {agent.pending}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenOverview(agent);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-b from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentOverviewTable;
export type { AgentOverview };
