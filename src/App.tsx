import { useState, useEffect } from 'react';
import { AdminLoginView } from './components/auth/AdminLoginView';
import { AppShell } from './components/layout/AppShell';
import type { IAdminUser } from './types';

function App() {
  const [adminUser, setAdminUser] = useState<IAdminUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('urbanico_admin_session');
      const savedUserData = localStorage.getItem('urbanico_admin_user');

      if (savedToken && savedUserData) {
        const parsed = JSON.parse(savedUserData);
        setAdminUser(parsed);
      }
    } catch {
      localStorage.removeItem('urbanico_admin_session');
      localStorage.removeItem('urbanico_admin_user');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const handleLoginSuccess = (user: IAdminUser) => {
    setAdminUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('urbanico_admin_session');
    localStorage.removeItem('urbanico_admin_user');
    setAdminUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg animate-pulse">
            U
          </div>
          <div className="text-xs font-semibold text-[#86868B]">
            Initializing Urbanico Admin...
          </div>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return <AppShell adminUser={adminUser} onLogout={handleLogout} />;
}

export default App;
