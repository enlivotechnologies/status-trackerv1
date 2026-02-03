import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collegesAPI, collegeNotesAPI } from '../../services/api';
import { College, CollegeDashboardStats, CollegeStatus, CollegeFollowUpStatus } from '../../types';
import AddCollegeModal from '../../components/agent/AddCollegeModal';
import Layout from '../../components/common/Layout';

const CollegeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<CollegeDashboardStats | null>(null);
  const [todaysColleges, setTodaysColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, collegesData] = await Promise.all([
        collegesAPI.getStats(),
        collegesAPI.getCollegesToFollowUpToday()
      ]);
      setStats(statsData);
      setTodaysColleges(collegesData);
    } catch (error) {
      console.error('Error fetching college data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollege = async (formData: any, initialNote: string) => {
    try {
      setIsCreating(true);
      const college = await collegesAPI.createCollege(formData);
      
      if (initialNote.trim()) {
        await collegeNotesAPI.createNote(college.id, initialNote);
      }
      
      setIsAddModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating college:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: CollegeStatus) => {
    switch (status) {
      case CollegeStatus.NEW:
        return 'bg-blue-100 text-blue-800';
      case CollegeStatus.CONTACTED:
        return 'bg-yellow-100 text-yellow-800';
      case CollegeStatus.SEMINAR_SCHEDULED:
        return 'bg-purple-100 text-purple-800';
      case CollegeStatus.SEMINAR_DONE:
        return 'bg-green-100 text-green-800';
      case CollegeStatus.CONVERTED:
        return 'bg-emerald-100 text-emerald-800';
      case CollegeStatus.NOT_INTERESTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFollowUpStatusColor = (status?: CollegeFollowUpStatus) => {
    switch (status) {
      case CollegeFollowUpStatus.PENDING:
        return 'bg-orange-100 text-orange-800';
      case CollegeFollowUpStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case CollegeFollowUpStatus.INTERESTED:
        return 'bg-blue-100 text-blue-800';
      case CollegeFollowUpStatus.NOT_INTERESTED:
        return 'bg-red-100 text-red-800';
      case CollegeFollowUpStatus.FOLLOW_UP_LATER:
        return 'bg-yellow-100 text-yellow-800';
      case CollegeFollowUpStatus.NOT_RESPONDING:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">College Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add College
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Colleges</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalColleges || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Follow-ups Today</p>
            <p className="text-2xl font-bold text-orange-600">{stats?.followUpsToday || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Seminars Scheduled</p>
            <p className="text-2xl font-bold text-purple-600">{stats?.seminarsScheduled || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Seminars Done</p>
            <p className="text-2xl font-bold text-green-600">{stats?.seminarsDone || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Converted</p>
            <p className="text-2xl font-bold text-emerald-600">{stats?.converted || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Pending Works</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.pendingWorks || 0}</p>
          </div>
        </div>

        {/* Today's Follow-ups */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Today's Follow-ups</h2>
            <button
              onClick={() => navigate('/agent/colleges')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All Colleges →
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {todaysColleges.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No follow-ups scheduled for today
              </div>
            ) : (
              todaysColleges.slice(0, 5).map((college) => (
                <div
                  key={college.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/agent/colleges/${college.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{college.collegeName}</h3>
                      <p className="text-sm text-gray-500">{college.contactPerson} • {college.phone}</p>
                      {college.city && (
                        <p className="text-sm text-gray-400">{college.city}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(college.status)}`}>
                        {college.status.replace(/_/g, ' ')}
                      </span>
                      {college.followUpStatus && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFollowUpStatusColor(college.followUpStatus)}`}>
                          {college.followUpStatus.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  {college.seminarDate && (
                    <p className="mt-2 text-sm text-purple-600">
                      Seminar: {new Date(college.seminarDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AddCollegeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreateCollege={handleCreateCollege}
        isCreating={isCreating}
      />
    </Layout>
  );
};

export default CollegeDashboard;
