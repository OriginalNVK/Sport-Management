import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UserManagement } from './components/UserManagement';
import { StadiumManagement } from './components/StadiumManagement';
import { Booking } from './components/Booking';
import { ServiceManagement } from './components/ServiceManagement';
import { Payment } from './components/Payment';
import { Profile } from './components/Profile';

export type PageType = 'dashboard' | 'users' | 'stadiums' | 'booking' | 'services' | 'payment' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'stadiums':
        return <StadiumManagement />;
      case 'booking':
        return <Booking />;
      case 'services':
        return <ServiceManagement />;
      case 'payment':
        return <Payment />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}
