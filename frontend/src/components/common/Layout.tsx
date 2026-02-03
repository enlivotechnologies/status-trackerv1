import { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'ADMIN') {
      return '/admin';
    }
    return '/agent/college-dashboard'; // Goes to College Dashboard for agents
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F6EE' }}>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => navigate(getDashboardPath())}
                className="text-xl font-bold text-purple-600"
              >
                College Management
              </button>
              
              {/* Navigation Links */}
              {user?.role !== 'ADMIN' && (
                <div className="hidden md:flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/agent')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/agent/today') || location.pathname === '/agent'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Leads
                  </button>
                  <button
                    onClick={() => navigate('/agent/college-dashboard')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/agent/college')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Colleges
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications Button */}
              {user?.role !== 'ADMIN' && (
                <button
                  onClick={() => navigate('/agent/notifications')}
                  className={`p-2 rounded-lg transition-colors relative ${
                    isActive('/agent/notifications')
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Notifications - Follow-up Reminders"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              )}
              <span className="text-sm text-gray-700">{user?.name}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
