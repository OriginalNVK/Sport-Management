import { useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UserManagement } from './components/UserManagement';
import { StadiumManagement } from './components/StadiumManagement';
import { Booking } from './components/Booking';
import { ServiceManagement } from './components/ServiceManagement';
import { Payment } from './components/Payment';
import { Profile } from './components/Profile';
import { ShiftManagement } from './components/ShiftManagement';
import { LeaveRequestManagement } from './components/LeaveRequestManagement';
import { MyLeaveRequests } from './components/MyLeaveRequests';
import { FieldStatusManagement } from './components/FieldStatusManagement';
export type PageType = 'dashboard' | 'users' | 'stadiums' | 'booking' | 'services' | 'payment' | 'profile' | 'shifts' | 'leave-requests' | 'my-leave-requests' | 'field-status';
export type UserRole = 'customer' | 'manager';
import { useEffect } from 'react';

export default function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('customer');
  // const [userRole, setUserRole] = useState<UserRole>('manager');
  // const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const savedPage = localStorage.getItem('currentPage');
    return (savedPage as PageType) || 'dashboard';
  });
  
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);
  
  const handleLogin = (email: string, role: UserRole) => {
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
    setShowRegister(false);
    setCurrentPage('dashboard');
    localStorage.removeItem('currentPage');
  };

  const handleRegisterSuccess = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    setShowRegister(false);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowRegister(false);
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
      case 'shifts':
        return <ShiftManagement />;
      case 'leave-requests':
        return <LeaveRequestManagement />;
      case 'my-leave-requests':
        return <MyLeaveRequests />;
      case 'field-status':
        return <FieldStatusManagement />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register 
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    );
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
