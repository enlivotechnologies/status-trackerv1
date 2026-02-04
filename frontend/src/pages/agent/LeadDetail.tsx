import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { leadsAPI, notesAPI } from '../../services/api';
import { Lead, Note, LeadStatus, LeadSource, ActivityLog } from '../../types';

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [formData, setFormData] = useState({
    status: '',
    followUpDate: '',
  });

  useEffect(() => {
    if (id) {
      fetchLead();
      fetchNotes();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      const data = await leadsAPI.getLeadById(id!);
      setLead(data);
      setFormData({
        status: data.status,
        followUpDate: data.followUpDate.split('T')[0],
      });
    } catch (error) {
      console.error('Failed to fetch lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const data = await notesAPI.getNotesByLead(id!);
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setIsSaving(true);
    try {
      await leadsAPI.updateLead(lead.id, {
        status: formData.status as LeadStatus,
        followUpDate: formData.followUpDate,
      });
      await fetchLead();
      alert('Lead updated successfully!');
      // Navigate back to dashboard to see updated list
      navigate('/agent');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !lead) return;

    try {
      await notesAPI.createNote(lead.id, newNote);
      setNewNote('');
      await fetchNotes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add note');
    }
  };

  const handleCall = () => {
    if (lead) {
      window.location.href = `tel:${lead.phone}`;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  if (!lead) {
    return (
      <Layout>
        <div className="text-center">Lead not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/agent')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Today's Calls
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <div className="mt-2 space-y-1">
              <div className="text-lg text-gray-700">
                <button
                  onClick={handleCall}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  📞 {lead.phone}
                </button>
              </div>
              {lead.project && (
                <div className="text-sm text-gray-500">Project: {lead.project}</div>
              )}
              {lead.location && (
                <div className="text-sm text-gray-500">Location: {lead.location}</div>
              )}
              <div className="text-sm text-gray-500">Source: {lead.source.replace('_', ' ')}</div>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {Object.values(LeadStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Next Follow-up Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Required - Every lead must have a follow-up date</p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h2>
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this interaction..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Add Note
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes History</h2>
          {notes.length === 0 ? (
            <p className="text-gray-500 text-sm">No notes yet</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-700">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log Section - Lightweight for owner trust */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activity Log
          </h2>
          {(!lead.activityLogs || lead.activityLogs.length === 0) ? (
            <p className="text-gray-500 text-sm">No activity recorded yet</p>
          ) : (
            <div className="space-y-3">
              {lead.activityLogs.map((activity: ActivityLog) => (
                <div key={activity.id} className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-b-0">
                  {/* Activity Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.action === 'STATUS_CHANGE' ? 'bg-purple-100' :
                    activity.action === 'FOLLOWUP_UPDATE' ? 'bg-blue-100' :
                    activity.action === 'FOLLOWUP_STATUS_CHANGE' ? 'bg-green-100' :
                    activity.action === 'LEAD_CREATED' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.action === 'STATUS_CHANGE' && (
                      <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    )}
                    {activity.action === 'FOLLOWUP_UPDATE' && (
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {activity.action === 'FOLLOWUP_STATUS_CHANGE' && (
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {activity.action === 'LEAD_CREATED' && (
                      <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {!['STATUS_CHANGE', 'FOLLOWUP_UPDATE', 'FOLLOWUP_STATUS_CHANGE', 'LEAD_CREATED'].includes(activity.action) && (
                      <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{activity.agentName}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(activity.createdAt).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeadDetail;
