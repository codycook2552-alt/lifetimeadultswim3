import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/AppNavbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { ClientPortal } from './pages/ClientPortal';
import { InstructorPortal } from './pages/InstructorPortal';
import { AdminPortal } from './pages/AdminPortal';
import { Booking } from './pages/Booking';
import { User, UserRole } from './types';
import { api } from './services/api';

const queryClient = new QueryClient();

type AppView = 'LANDING' | 'LOGIN' | 'PORTAL' | 'BOOKING';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('LANDING');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      if (user) setCurrentView('PORTAL');
    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('PORTAL');
  };

  const handleLogout = async () => {
    await api.signOut();
    setCurrentUser(null);
    setCurrentView('LANDING');
  };

  const handleStartBooking = () => {
    if (currentUser) {
      setCurrentView('BOOKING');
    } else {
      setCurrentView('LOGIN');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    switch (currentView) {
      case 'LANDING':
        return <Landing onStartBooking={handleStartBooking} />;

      case 'LOGIN':
        return (
          <Login
            onLogin={handleLogin}
            onNavigateToLanding={() => setCurrentView('LANDING')}
          />
        );

      case 'BOOKING':
        if (!currentUser) return <Login onLogin={handleLogin} onNavigateToLanding={() => setCurrentView('LANDING')} />;
        return (
          <Booking
            user={currentUser}
            onComplete={() => {
              checkUser(); // Refresh user data (credits)
              setCurrentView('PORTAL');
            }}
            onCancel={() => setCurrentView('PORTAL')}
          />
        );

      case 'PORTAL':
        if (!currentUser) return <Landing onStartBooking={handleStartBooking} />;

        switch (currentUser.role) {
          case UserRole.CLIENT:
            return (
              <ClientPortal
                user={currentUser}
                onBookClick={() => setCurrentView('BOOKING')}
              />
            );
          case UserRole.INSTRUCTOR:
            return <InstructorPortal currentUser={currentUser} />;
          case UserRole.ADMIN:
            return <AdminPortal />;
          default:
            return <div>Unknown Role</div>;
        }

      default:
        return <Landing onStartBooking={handleStartBooking} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {currentView !== 'LOGIN' && !isLoading && (
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          onLoginClick={() => setCurrentView('LOGIN')}
          onHomeClick={() => setCurrentView(currentUser ? 'PORTAL' : 'LANDING')}
        />
      )}
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
