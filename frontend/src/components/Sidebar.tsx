import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar, 
  Wrench, 
  CreditCard, 
  UserCircle,
  LogOut,
  Briefcase,
  BarChart3,
  Clock,
  FileText
} from 'lucide-react';
import type { PageType } from '../App';
import type { UserRole } from '../App';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  userRole: UserRole;
  userEmail: string;
  onLogout: () => void;
}

export function Sidebar({ currentPage, onPageChange, userRole, userEmail, onLogout }: SidebarProps) {
  // Menu items for manager role
  const managerMenuItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users' as PageType, label: 'User Management', icon: Users },
    { id: 'shifts' as PageType, label: 'Shift Management', icon: Clock },
    { id: 'leave-requests' as PageType, label: 'Leave Requests', icon: FileText },
    { id: 'stadiums' as PageType, label: 'Stadium Management', icon: Building2 },
    { id: 'booking' as PageType, label: 'Booking', icon: Calendar },
    { id: 'services' as PageType, label: 'Service Management', icon: Wrench },
    { id: 'payment' as PageType, label: 'Payment', icon: CreditCard },
    { id: 'profile' as PageType, label: 'Profile', icon: UserCircle }
  ];

  // Menu items for customer role
  const customerMenuItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'booking' as PageType, label: 'Booking', icon: Calendar },
    { id: 'services' as PageType, label: 'Services', icon: Briefcase },
    { id: 'payment' as PageType, label: 'Payment', icon: CreditCard },
    { id: 'my-leave-requests' as PageType, label: 'My Leave Requests', icon: FileText },
    { id: 'field-status' as PageType, label: 'Field Status', icon: Building2 },
    { id: 'profile' as PageType, label: 'Profile', icon: UserCircle },
  ];

  // Select menu items based on user role
  const menuItems = userRole === 'manager' ? managerMenuItems : customerMenuItems;

  return (
    <aside className="w-80 bg-black border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold">Sport Hub</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2 capitalize">{userRole} Portal</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{userEmail}</p>
            <p className="text-gray-400 text-xs capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}