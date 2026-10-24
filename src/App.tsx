import { useState } from 'react';
import { AdminLoginView } from './components/auth/AdminLoginView';
import { AppShell } from './components/layout/AppShell';
import type { IAdminUser } from './types';

function getInitialUser(): IAdminUser | null {
  try {
    const savedToken = localStorage.getItem('urbanico_admin_session');
    const savedUserData = localStorage.getItem('urbanico_admin_user');
    if (savedToken && savedUserData) {
      return JSON.parse(savedUserData);
    }
  } catch {
    localStorage.removeItem('urbanico_admin_session');
    localStorage.removeItem('urbanico_admin_user');
  }
  return null;
}

function App() {
  const [adminUser, setAdminUser] = useState<IAdminUser | null>(getInitialUser);

  const handleLoginSuccess = (user: IAdminUser) => {
    setAdminUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('urbanico_admin_session');
    localStorage.removeItem('urbanico_admin_user');
    setAdminUser(null);
  };

  if (!adminUser) {
    return <AdminLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return <AppShell adminUser={adminUser} onLogout={handleLogout} />;
}

export default App;
