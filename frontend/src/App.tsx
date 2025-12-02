import { useState } from 'react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UserManagement } from './components/UserManagement';
import { StadiumManagement } from './components/StadiumManagement';
import { Booking } from './components/Booking';
import { ServiceManagement } from './components/ServiceManagement';
import { Payment } from './components/Payment';
import { Profile } from './components/Profile';

export type PageType = 'dashboard' | 'users' | 'stadiums' | 'booking' | 'services' | 'payment' | 'profile';
export type UserRole = 'customer' | 'manager';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const handleLogin = (email: string, role: UserRole) => {
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setUserRole('customer');
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userRole={userRole} />;
      case 'users':
        return <UserManagement />;
      case 'stadiums':
        return <StadiumManagement />;
      case 'booking':
        return <Booking userRole={userRole} onNavigate={setCurrentPage} />;
      case 'services':
        return <ServiceManagement userRole={userRole} onNavigate={setCurrentPage} />;
      case 'payment':
        return <Payment userRole={userRole} />;
      case 'profile':
        return <Profile userEmail={userEmail} userRole={userRole} />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        userRole={userRole}
        userEmail={userEmail}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {renderPage()}
      </main>
    </div>
  );
}
