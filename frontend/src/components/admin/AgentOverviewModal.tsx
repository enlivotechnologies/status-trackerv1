import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AgentOverview } from './AgentOverviewTable';

interface AgentOverviewModalProps {
  isOpen: boolean;
  agent: AgentOverview | null;
  onClose: () => void;
}

const AgentOverviewModal = ({ isOpen, agent, onClose }: AgentOverviewModalProps) => {
  if (!isOpen || !agent) return null;

  const getAgentChartData = (agent: AgentOverview) => {
    const performanceData = [
      { name: 'Today', value: agent.leadsToday, color: '#3B82F6' },
      { name: 'This Week', value: agent.leadsWeek, color: '#8B5CF6' },
      { name: 'This Month', value: agent.leadsMonth, color: '#10B981' },
    ];

    const statusData = [
      { name: 'Pending Works', value: agent.pending, color: '#F59E0B' },
      { name: 'Completed', value: agent.completed, color: '#10B981' },
    ];

    return { performanceData, statusData };
  };

  const { performanceData, statusData } = getAgentChartData(agent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-gray-200" style={{ backgroundColor: '#FEFDFB' }}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{agent.agentName}</h2>
            <p className="text-sm text-gray-500 mt-1">{agent.agentEmail}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Performance Bar Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Generation Performance</h3>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FEFDFB', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Works vs Completed Leads</h3>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Leads Today</div>
              <div className="text-2xl font-bold text-gray-900">{agent.leadsToday}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Leads This Week</div>
              <div className="text-2xl font-bold text-gray-900">{agent.leadsWeek}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Leads This Month</div>
              <div className="text-2xl font-bold text-gray-900">{agent.leadsMonth}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Pending Works</div>
              <div className="text-2xl font-bold text-amber-600">{agent.pending || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOverviewModal;
