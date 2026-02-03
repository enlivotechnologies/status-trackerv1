import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start">
        {/* Left Side - Logo and Welcome Message */}
        <div className="flex items-center space-x-4">
          {/* Logo/Icon */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
          </div>
          
          {/* Welcome Message */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of all coordinators and colleges
            </p>
          </div>
        </div>

        {/* Right Side - Notifications, Logout and View All Leads Button */}
        <div className="flex items-center space-x-4">
          {/* Notifications Button */}
          <button 
            onClick={() => navigate('/admin/notifications')}
            className="p-2 text-gray-700 hover:text-gray-900 transition-colors relative"
            title="Work Notifications"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
            title="Logout"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          
          <button
            onClick={() => navigate('/admin/leads')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
          >
            View All Colleges
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;
