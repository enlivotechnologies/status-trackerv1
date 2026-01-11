import { useNavigate } from 'react-router-dom';
import { Lead, FollowUpStatus } from '../../types';
import { formatFollowUpDate, formatDateTime, getFollowUpStatusLabel } from './utils';

interface TodaysLeadsProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: FollowUpStatus) => void;
}

const TodaysLeads = ({ leads, onStatusChange }: TodaysLeadsProps) => {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-4 rounded-xl shadow-sm p-5 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-900">Today's Leads</h3>
        <button
          onClick={() => navigate('/agent/leads')}
          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors font-medium"
        >
          <span>View all</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {leads.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-gray-400">No leads created today</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 w-auto">Name</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 w-[100px]">Follow up</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 w-[120px]">Number</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 w-auto">Project</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 w-[160px]">Status</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 w-[130px]">Time & Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {leads.map((lead, index) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-xs font-semibold text-white">
                          {lead.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{formatFollowUpDate(lead.followUpDate)}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700 font-mono">{lead.phone}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-gray-700 truncate max-w-[100px] block">{lead.project || lead.location || '-'}</span>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={lead.followUpStatus || FollowUpStatus.PENDING}
                      onChange={(e) => {
                        const newStatus = e.target.value as FollowUpStatus;
                        onStatusChange(lead.id, newStatus);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="text-xs px-2.5 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 bg-white text-gray-900 cursor-pointer w-full max-w-[150px] font-medium hover:border-gray-400 transition-colors"
                    >
                      {Object.values(FollowUpStatus).map((status) => (
                        <option key={status} value={status}>
                          {getFollowUpStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs text-gray-600">
                      {lead.createdAt ? formatDateTime(lead.createdAt) : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TodaysLeads;
