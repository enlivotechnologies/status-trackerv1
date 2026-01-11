import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsAPI, notesAPI } from '../../services/api';
import { LeadSource, LeadStatus } from '../../types';

const CreateLead = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    project: '',
    location: '',
    source: LeadSource.CALL,
    status: LeadStatus.NEW,
    followUpDate: new Date().toISOString().split('T')[0],
  });
  const [initialNote, setInitialNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create the lead first
      const newLead = await leadsAPI.createLead(formData);
      
      // If there's an initial note, create it
      if (initialNote.trim()) {
        try {
          await notesAPI.createNote(newLead.id, initialNote.trim());
        } catch (noteError) {
          console.error('Failed to create initial note:', noteError);
          // Don't fail the whole operation if note creation fails
        }
      }
      
      // Navigate to dashboard which will show the new lead
      navigate('/agent');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create lead');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl shadow-sm p-6 border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
            <button
              onClick={() => navigate('/agent')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm"
                    placeholder="Enter lead name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Project</label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm"
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white text-sm"
                  >
                    {Object.values(LeadSource).map((source) => (
                      <option key={source} value={source}>
                        {source.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Follow-up Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="pt-3 border-t border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Initial Note (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Add any initial notes or context about this lead
              </p>
              <textarea
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                placeholder="Enter any notes about this lead..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-3 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-5 py-2.5 bg-gradient-to-b from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'Creating...' : 'Create Lead'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/agent')}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLead;
