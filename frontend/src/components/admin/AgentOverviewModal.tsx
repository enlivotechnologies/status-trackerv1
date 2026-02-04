import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AgentOverview } from './AgentOverviewTable';
import { Lead, FollowUpStatus } from '../../types';
import { leadsAPI } from '../../services/api';
import AgentLeadsMap from './AgentLeadsMap';

interface AgentOverviewModalProps {
  isOpen: boolean;
  agent: AgentOverview | null;
  onClose: () => void;
}

const getFollowUpStatusLabel = (status?: FollowUpStatus) => {
  if (!status) return 'In Progress';
  const labels: Record<FollowUpStatus, string> = {
    [FollowUpStatus.PENDING]: 'In Progress',
    [FollowUpStatus.SELECT_DATE]: 'Select Date',
    [FollowUpStatus.COMPLETED]: 'Closed Deal',
    [FollowUpStatus.NOT_NEGOTIABLE]: 'Not Negotiable',
    [FollowUpStatus.INTERESTED]: 'Interested',
    [FollowUpStatus.FOLLOW_UP_LATER]: 'Follow Up Later',
    [FollowUpStatus.NOT_RESPONDING]: 'Not Responding',
    [FollowUpStatus.SITE_VISIT_DONE]: 'Site Visit Done',
  };
  return labels[status] || 'In Progress';
};

const getStatusColor = (status?: FollowUpStatus) => {
  if (!status) return 'bg-gray-100 text-gray-700';
  const colors: Record<FollowUpStatus, string> = {
    [FollowUpStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
    [FollowUpStatus.SELECT_DATE]: 'bg-blue-100 text-blue-700',
    [FollowUpStatus.COMPLETED]: 'bg-green-100 text-green-700',
    [FollowUpStatus.NOT_NEGOTIABLE]: 'bg-red-100 text-red-700',
    [FollowUpStatus.INTERESTED]: 'bg-purple-100 text-purple-700',
    [FollowUpStatus.FOLLOW_UP_LATER]: 'bg-orange-100 text-orange-700',
    [FollowUpStatus.NOT_RESPONDING]: 'bg-gray-100 text-gray-700',
    [FollowUpStatus.SITE_VISIT_DONE]: 'bg-teal-100 text-teal-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const AgentOverviewModal = ({ isOpen, agent, onClose }: AgentOverviewModalProps) => {
  const [agentLeads, setAgentLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [activeTab, setActiveTab] = useState<'charts' | 'leads' | 'map'>('charts');

  useEffect(() => {
    if (isOpen && agent) {
      fetchAgentLeads();
    }
  }, [isOpen, agent]);

  const fetchAgentLeads = async () => {
    if (!agent) return;
    setIsLoadingLeads(true);
    try {
      const leads = await leadsAPI.getLeadsByAgent(agent.agentId);
      setAgentLeads(leads);
    } catch (error) {
      console.error('Failed to fetch agent leads:', error);
      setAgentLeads([]);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  if (!isOpen || !agent) return null;

  const getAgentChartData = (agent: AgentOverview) => {
    const performanceData = [
      { name: 'Today', value: agent.leadsToday, color: '#9333EA' },
      { name: 'This Week', value: agent.leadsWeek, color: '#A855F7' },
      { name: 'This Month', value: agent.leadsMonth, color: '#C084FC' },
    ];

    const statusData = [
      { name: 'In Progress', value: agent.pending, color: '#F59E0B' },
      { name: 'Seminars Done', value: agent.completed, color: '#10B981' },
    ];

    return { performanceData, statusData };
  };

  const { performanceData, statusData } = getAgentChartData(agent);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
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

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6" style={{ backgroundColor: '#FEFDFB' }}>
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('charts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'charts'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Charts & Stats
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'leads'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎓 All Colleges ({agentLeads.length})
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'map'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🗺️ Location Map
            </button>
          </nav>
        </div>

        <div className="p-6 space-y-8">
          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <>
              {/* Performance Bar Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">College Addition Performance</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Works vs Seminars Done</h3>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          const safePercent = percent ?? 0;
                          return `${name}: ${(safePercent * 100).toFixed(0)}%`;
                        }}
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
                  <div className="text-sm text-gray-500 mb-1">Colleges Today</div>
                  <div className="text-2xl font-bold text-gray-900">{agent.leadsToday}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Colleges This Week</div>
                  <div className="text-2xl font-bold text-gray-900">{agent.leadsWeek}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Colleges This Month</div>
                  <div className="text-2xl font-bold text-gray-900">{agent.leadsMonth}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Pending Works</div>
                  <div className="text-2xl font-bold text-amber-600">{agent.pending || 0}</div>
                </div>
              </div>
            </>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Colleges ({agentLeads.length})</h3>
              {isLoadingLeads ? (
                <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
                  <div className="text-gray-500">Loading colleges...</div>
                </div>
              ) : agentLeads.length === 0 ? (
                <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mt-4 text-sm text-gray-500">No colleges found for this coordinator</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow-up</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {agentLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                                  <span className="text-xs font-medium text-white">
                                    {lead.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lead.location || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lead.project || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.followUpStatus)}`}>
                                {getFollowUpStatusLabel(lead.followUpStatus)}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(lead.followUpDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {lead.createdAt ? formatDate(lead.createdAt) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">College Locations</h3>
              <AgentLeadsMap leads={agentLeads} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentOverviewModal;
