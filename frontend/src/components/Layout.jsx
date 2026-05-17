import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Calendar, Scissors, LogOut } from 'lucide-react';
import { logout } from '@/services/authService';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/clients',      icon: Users,     label: 'Клієнти'  },
  { to: '/appointments', icon: Calendar,  label: 'Записи'   },
  { to: '/services',     icon: Scissors,  label: 'Послуги'  },
];

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Scissors size={20} className="text-pink-500" />
            <span className="font-semibold text-gray-900">Hair CRM</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors',
                isActive ? 'text-pink-500' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
