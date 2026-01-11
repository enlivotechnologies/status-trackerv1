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
            <img 
              src="https://i.pinimg.com/1200x/7a/a1/d2/7aa1d2d02f060691bf7f5a3b76487a02.jpg" 
              alt="Logo" 
              className="h-12 w-12 object-contain rounded-lg"
            />
          </div>
          
          {/* Welcome Message */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of all agents and leads
            </p>
          </div>
        </div>

        {/* Right Side - Logout and View All Leads Button */}
        <div className="flex items-center space-x-4">
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
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
          >
            View All Leads
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;
