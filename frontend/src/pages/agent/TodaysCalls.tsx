import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { leadsAPI, notesAPI, dashboardAPI } from '../../services/api';
import { Lead, FollowUpStatus, LeadStatus } from '../../types';
import AddLeadModal from '../../components/agent/AddLeadModal';
import AddNoteModal from '../../components/agent/AddNoteModal';
import { useDashboardData } from '../../components/agent/hooks/useDashboardData';
import { formatFollowUpDate, getFollowUpStatusLabel, formatLastContacted } from '../../components/agent/utils';

const TodaysCalls = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { stats, recentLeads, isLoading, fetchDashboardData, setRecentLeads, setStats } = useDashboardData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedLeadForNote, setSelectedLeadForNote] = useState<Lead | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateLead = async (formData: any, initialNote: string) => {
    setIsCreating(true);
    try {
      const newLead = await leadsAPI.createLead(formData);
      
      if (initialNote.trim()) {
        try {
          await notesAPI.createNote(newLead.id, initialNote.trim());
        } catch (noteError) {
          console.error('Failed to create initial note:', noteError);
        }
      }
      
      setIsModalOpen(false);
      await fetchDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create lead');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: FollowUpStatus) => {
    try {
      const currentLead = recentLeads.find(lead => lead.id === leadId);
      if (!currentLead) return;

      const updateData: any = { followUpStatus: newStatus };
      
      if (currentLead.followUpStatus === FollowUpStatus.SITE_VISIT_DONE && newStatus !== FollowUpStatus.SITE_VISIT_DONE) {
        if (newStatus === FollowUpStatus.COMPLETED) {
          updateData.status = LeadStatus.CLOSED;
        } else if (newStatus === FollowUpStatus.NOT_NEGOTIABLE) {
          updateData.status = LeadStatus.LOST;
        } else {
          updateData.status = LeadStatus.CONTACTED;
        }
      } else if (newStatus === FollowUpStatus.SITE_VISIT_DONE && currentLead.status !== LeadStatus.SITE_VISIT_DONE) {
        updateData.status = LeadStatus.SITE_VISIT_DONE;
      } else if (newStatus === FollowUpStatus.COMPLETED && currentLead.status !== LeadStatus.CLOSED && currentLead.status !== LeadStatus.LOST) {
        updateData.status = LeadStatus.CLOSED;
      } else if (newStatus === FollowUpStatus.NOT_NEGOTIABLE && currentLead.status !== LeadStatus.LOST && currentLead.status !== LeadStatus.CLOSED) {
        updateData.status = LeadStatus.LOST;
      }

      setRecentLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { ...lead, followUpStatus: newStatus, ...(updateData.status ? { status: updateData.status } : {}) }
            : lead
        )
      );
      
      await leadsAPI.updateLead(leadId, updateData);
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchDashboardData();
      
      const freshStats = await dashboardAPI.getStats();
      setStats(freshStats);
    } catch (error) {
      console.error('Failed to update status:', error);
      await fetchDashboardData();
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDateChange = async (leadId: string, newDate: string) => {
    try {
      const dateObj = new Date(newDate);
      dateObj.setHours(9, 0, 0, 0);
      const isoDateTime = dateObj.toISOString();
      
      // Show notification
      const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      setShowNotification(`New follow-up date selected: ${formattedDate}`);
      setTimeout(() => setShowNotification(null), 3000);

      const updateData = { 
        followUpDate: isoDateTime,
        followUpStatus: FollowUpStatus.FOLLOW_UP_LATER
      };

      setRecentLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { ...lead, followUpDate: isoDateTime, followUpStatus: FollowUpStatus.FOLLOW_UP_LATER }
            : lead
        )
      );
      
      await leadsAPI.updateLead(leadId, updateData);
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchDashboardData();
      
      const freshStats = await dashboardAPI.getStats();
      setStats(freshStats);
    } catch (error) {
      console.error('Failed to update date:', error);
      await fetchDashboardData();
      alert('Failed to update date. Please try again.');
    }
  };

  const handleOpenNoteModal = (lead: Lead) => {
    setSelectedLeadForNote(lead);
    setIsNoteModalOpen(true);
  };

  const handleAddNote = async (leadId: string, content: string) => {
    setIsAddingNote(true);
    try {
      await notesAPI.createNote(leadId, content);
      setIsNoteModalOpen(false);
      setSelectedLeadForNote(null);
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Failed to add note. Please try again.');
      throw error;
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
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
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{showNotification}</span>
        </div>
      )}
      
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">{user?.name || 'Agent'}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/agent/leads')}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                All Leads
              </button>
              <button
                onClick={() => navigate('/agent/notifications')}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors relative"
                title="Notifications"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {stats && stats.pendingWorks > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                    {stats.pendingWorks > 9 ? '9+' : stats.pendingWorks}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-b from-yellow-500 to-yellow-400 text-white text-sm font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm hover:shadow-md transition-all"
              >
                <span>Add Lead</span>
                <span className="text-base font-bold">+</span>
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Logout"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Today's Calls Only */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats Bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Today's Calls
            <span className="ml-3 text-lg font-semibold text-yellow-600">
              {recentLeads.length} {recentLeads.length === 1 ? 'lead' : 'leads'}
            </span>
          </h1>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1.5 text-gray-600">
              <span className="font-medium">{stats?.followUpsToday || 0}</span>
              <span>follow-ups</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-1.5 text-green-600">
              <span className="font-medium">{stats?.dealsClosed || 0}</span>
              <span>closed</span>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        {recentLeads.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No calls scheduled for today</h3>
            <p className="mt-2 text-sm text-gray-500">Add a new lead to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Add New Lead
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Follow-up</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Contacted</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                          <span className="text-sm font-semibold text-white">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          <div className="text-xs text-gray-500">{lead.location || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleCall(lead.phone)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="font-mono">{lead.phone}</span>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{lead.project || '-'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{formatFollowUpDate(lead.followUpDate)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm ${!lead.lastContactedDate ? 'text-red-500 font-medium' : 'text-gray-700'}`}>
                        {formatLastContacted(lead.lastContactedDate)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {showDatePicker === lead.id ? (
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleDateChange(lead.id, e.target.value);
                              setShowDatePicker(null);
                            }
                          }}
                          onBlur={() => setTimeout(() => setShowDatePicker(null), 300)}
                          autoFocus
                          className="text-sm px-3 py-1.5 rounded-lg border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-white"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <select
                            value={lead.followUpStatus || FollowUpStatus.PENDING}
                            onChange={(e) => {
                              const newStatus = e.target.value as FollowUpStatus;
                              if (newStatus === FollowUpStatus.FOLLOW_UP_LATER) {
                                setShowDatePicker(lead.id);
                              } else {
                                handleStatusChange(lead.id, newStatus);
                              }
                            }}
                            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 bg-white cursor-pointer font-medium hover:border-gray-400 transition-colors"
                          >
                            {Object.values(FollowUpStatus).filter(status => status !== FollowUpStatus.SELECT_DATE).map((status) => (
                              <option key={status} value={status}>
                                {getFollowUpStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                          {lead.followUpStatus === FollowUpStatus.FOLLOW_UP_LATER && (
                            <button
                              onClick={() => setShowDatePicker(lead.id)}
                              className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                              title="Change follow-up date"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCall(lead.phone)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Call"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenNoteModal(lead)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                          title="Add Note"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => navigate(`/agent/lead/${lead.id}`)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="View Details"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateLead={handleCreateLead}
        isCreating={isCreating}
      />

      <AddNoteModal
        isOpen={isNoteModalOpen}
        lead={selectedLeadForNote}
        onClose={() => { setIsNoteModalOpen(false); setSelectedLeadForNote(null); }}
        onAddNote={handleAddNote}
        isAdding={isAddingNote}
      />
    </div>
  );
};

export default TodaysCalls;
