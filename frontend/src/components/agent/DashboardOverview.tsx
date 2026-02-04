import { DashboardStats } from '../../types';

interface DashboardOverviewProps {
  stats: DashboardStats | null;
}

const DashboardOverview = ({ stats }: DashboardOverviewProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Overview</h2>
      
      {/* Critical Alerts - Overdue Follow-ups and Not Contacted */}
      {((stats?.overdueLeadsCount || 0) > 0 || (stats?.leadsNotContactedIn3Days || 0) > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
          {/* Overdue Follow-ups */}
          {(stats?.overdueLeadsCount || 0) > 0 && (
            <div className="rounded-xl shadow-sm p-4 border-2 border-red-300 bg-red-50">
              <div className="flex items-center space-x-3 mb-3">
                <svg className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm font-bold text-red-800">Overdue Follow-ups</div>
              </div>
              <div className="text-3xl font-bold text-red-600">{stats?.overdueLeadsCount || 0}</div>
              <p className="text-xs text-red-700 mt-1">Leads past their follow-up date</p>
            </div>
          )}

          {/* Leads Not Contacted in 3 Days */}
          {(stats?.leadsNotContactedIn3Days || 0) > 0 && (
            <div className="rounded-xl shadow-sm p-4 border-2 border-orange-300 bg-orange-50">
              <div className="flex items-center space-x-3 mb-3">
                <svg className="h-6 w-6 text-orange-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm font-bold text-orange-800">Not Contacted (3+ days)</div>
              </div>
              <div className="text-3xl font-bold text-orange-600">{stats?.leadsNotContactedIn3Days || 0}</div>
              <p className="text-xs text-orange-700 mt-1">Leads not contacted in last 3 days</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Leads */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Total Leads</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.totalLeads || 0}</div>
        </div>

        {/* Follow-ups */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Follow-ups</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.followUpsToday || 0}</div>
        </div>

        {/* Site Visits */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Site Visits</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.siteVisitsDone || 0}</div>
        </div>

        {/* Deal Closed */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">Deal Closed</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.dealsClosed || 0}</div>
        </div>

        {/* Pending Works */}
        <div className="rounded-xl shadow-sm p-4 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex items-center space-x-3 mb-3">
            <svg className="h-6 w-6 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-900">In Progress</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.pendingWorks !== undefined && stats?.pendingWorks !== null 
              ? Number(stats.pendingWorks) 
              : 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
