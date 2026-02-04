import { useState } from 'react';
import { CollegeStatus, SeminarStatus } from '../../types';

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCollege: (formData: any, initialNote: string) => Promise<void>;
  isCreating: boolean;
}

const AddCollegeModal = ({ isOpen, onClose, onCreateCollege, isCreating }: AddCollegeModalProps) => {
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    collegeName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    seminarDate: '',
    seminarStatus: SeminarStatus.NOT_YET_SCHEDULED,
    followUpDate: getTodayDate(),
    status: CollegeStatus.NEW,
  });
  const [initialNote, setInitialNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateCollege(formData, initialNote);
    // Reset form after successful creation
    setFormData({
      collegeName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      seminarDate: '',
      seminarStatus: SeminarStatus.NOT_YET_SCHEDULED,
      followUpDate: getTodayDate(),
      status: CollegeStatus.NEW,
    });
    setInitialNote('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-gray-200" style={{ backgroundColor: '#FEFDFB' }}>
          <h1 className="text-2xl font-bold text-gray-900">Add New College</h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  College Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
                  placeholder="Enter college name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
                  placeholder="Enter contact person name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: numericValue });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
                  placeholder="Enter address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Seminar Status</label>
                <select
                  value={formData.seminarStatus}
                  onChange={(e) => setFormData({ ...formData, seminarStatus: e.target.value as SeminarStatus })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white text-sm"
                >
                  <option value={SeminarStatus.NOT_YET_SCHEDULED}>Not Yet Scheduled</option>
                  <option value={SeminarStatus.WAITING_FOR_APPROVAL}>Waiting for Approval</option>
                  <option value={SeminarStatus.SCHEDULED}>Scheduled</option>
                  <option value={SeminarStatus.COMPLETED}>Completed</option>
                  <option value={SeminarStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Seminar Date {formData.seminarStatus === SeminarStatus.SCHEDULED && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  value={formData.seminarDate}
                  onChange={(e) => setFormData({ ...formData, seminarDate: e.target.value })}
                  disabled={formData.seminarStatus !== SeminarStatus.SCHEDULED && formData.seminarStatus !== SeminarStatus.COMPLETED}
                  required={formData.seminarStatus === SeminarStatus.SCHEDULED}
                  className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm ${
                    formData.seminarStatus !== SeminarStatus.SCHEDULED && formData.seminarStatus !== SeminarStatus.COMPLETED
                      ? 'bg-gray-100 cursor-not-allowed'
                      : ''
                  }`}
                />
                {(formData.seminarStatus === SeminarStatus.NOT_YET_SCHEDULED || formData.seminarStatus === SeminarStatus.WAITING_FOR_APPROVAL) && (
                  <p className="text-xs text-gray-500 mt-1">Date will be enabled when status is "Scheduled"</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Next Follow-up Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as CollegeStatus })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white text-sm"
                >
                  {Object.values(CollegeStatus).map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Initial Note Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Initial Note (Optional)
            </label>
            <textarea
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm resize-none"
              placeholder="Add any initial notes about this college..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create College'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCollegeModal;
