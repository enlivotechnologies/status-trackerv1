import { Lead } from '../../types';

interface NewsItem {
  type: 'note' | 'pending_work' | 'pending';
  leadName: string;
  message: string;
  time: string;
  lead?: Lead;
  work?: any;
  note?: any;
  timestamp?: number;
  priority?: 'critical' | 'high' | 'normal';
  isFromYesterday?: boolean;
}

interface ImportantNewsProps {
  news: NewsItem[];
  onAddNote: (lead: Lead) => void;
  pendingWorksCount?: number;
}

const ImportantNews = ({ news, onAddNote }: ImportantNewsProps) => {
  // Filter out individual pending work items, keep only the reminder
  const filteredNews = news.filter(item => {
    // Keep the reminder (first pending_work item) and all notes
    if (item.type === 'pending_work') {
      // Only keep if it's the reminder message (has "There is/are" in message)
      return item.message.includes('There') && item.message.includes('pending work');
    }
    return true; // Keep all notes and other items
  });

  const formatMessage = (item: NewsItem): string => {
    // Don't truncate - let it wrap naturally
    return item.message;
  };

  const renderNewsItem = (item: NewsItem, index: number) => {
    const isPendingWorkReminder = item.type === 'pending_work';
    const isNote = item.type === 'note';

    if (isPendingWorkReminder) {
      return (
        <div key={index} className="rounded-lg p-3 bg-red-50 border border-red-200">
          <p className="text-xs font-medium text-red-700 leading-snug">
            {item.message}
          </p>
        </div>
      );
    }

    return (
      <div key={index} className="rounded-lg p-3 bg-white border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between gap-3">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 mb-1 leading-tight">
              {isNote ? `Note added for ${item.leadName}` : `Follow up with ${item.leadName}`}
            </p>
            <p className="text-xs text-gray-600 leading-snug break-words">
              {formatMessage(item)}
            </p>
          </div>
          
          {/* Time and Add Note Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">{item.time}</span>
            </div>
            {item.lead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNote(item.lead!);
                }}
                className="h-6 w-6 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
                title="Add note"
              >
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="lg:col-span-2 rounded-xl shadow-sm p-4 border border-black/10 flex flex-col" style={{ backgroundColor: '#FEFDFB' }}>
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900">Important News</h3>
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {filteredNews.length === 0 ? (
          <div className="text-center py-6 h-full flex items-center justify-center">
            <p className="text-xs text-gray-400">No recent activities</p>
          </div>
        ) : (
          <div className="h-[240px] overflow-y-auto pr-1.5 space-y-2 custom-scrollbar">
            {filteredNews.map((item, index) => renderNewsItem(item, index))}
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
};

export default ImportantNews;
