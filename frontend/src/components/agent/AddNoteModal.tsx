import { useState, useEffect } from 'react';
import { Lead } from '../../types';

interface AddNoteModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onAddNote: (leadId: string, content: string) => Promise<void>;
  isAdding: boolean;
}

const AddNoteModal = ({ isOpen, lead, onClose, onAddNote, isAdding }: AddNoteModalProps) => {
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNoteContent('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !noteContent.trim()) return;

    await onAddNote(lead.id, noteContent.trim());
    setNoteContent('');
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="relative w-full max-w-md rounded-xl shadow-lg border border-black/10" style={{ backgroundColor: '#FEFDFB' }}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Note for {lead.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Note Content
            </label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter your note..."
              rows={4}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all outline-none resize-none text-sm"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isAdding || !noteContent.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-b from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isAdding ? 'Adding...' : 'Add Note'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;
