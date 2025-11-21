import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar, 
  Wrench, 
  CreditCard, 
  UserCircle 
} from 'lucide-react';
import type { PageType } from '../App';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users' as PageType, label: 'User Management', icon: Users },
    { id: 'stadiums' as PageType, label: 'Stadium Management', icon: Building2 },
    { id: 'booking' as PageType, label: 'Booking', icon: Calendar },
    { id: 'services' as PageType, label: 'Service Management', icon: Wrench },
    { id: 'payment' as PageType, label: 'Payment', icon: CreditCard },
    { id: 'profile' as PageType, label: 'Profile', icon: UserCircle },
  ];

  return (
    <aside className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-gray-800">SportHub Pro</span>
        </h1>
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
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
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

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full" />
          <div>
            <p className="text-gray-800">Admin User</p>
            <p className="text-gray-500 text-sm">admin@sporthub.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}