import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collegesAPI, collegeNotesAPI } from '../../services/api';
import { College, CollegeStatus, CollegeFollowUpStatus } from '../../types';
import AddCollegeModal from '../../components/agent/AddCollegeModal';
import Layout from '../../components/common/Layout';

const AllColleges = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const data = await collegesAPI.getColleges();
      setColleges(data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
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
      fetchColleges();
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

  const filteredColleges = colleges.filter((college) => {
    const matchesSearch = 
      college.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.phone.includes(searchTerm) ||
      (college.city && college.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || college.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">All Colleges</h1>
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by college name, contact, phone, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            {(Object.values(CollegeStatus) as string[]).map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Colleges Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seminar Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Follow-up Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredColleges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No colleges found
                    </td>
                  </tr>
                ) : (
                  filteredColleges.map((college) => (
                    <tr
                      key={college.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/agent/colleges/${college.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{college.collegeName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{college.contactPerson}</div>
                        <div className="text-sm text-gray-500">{college.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {college.city || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(college.status)}`}>
                            {college.status.replace(/_/g, ' ')}
                          </span>
                          {college.followUpStatus && (
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getFollowUpStatusColor(college.followUpStatus)}`}>
                              {college.followUpStatus.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {college.seminarDate 
                          ? new Date(college.seminarDate).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(college.followUpDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-sm text-gray-500 text-right">
          Showing {filteredColleges.length} of {colleges.length} colleges
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

export default AllColleges;
