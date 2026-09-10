import { useState, useEffect } from 'react';
import { User } from './types';
import { getCurrentUser, setCurrentUser, initializeStore } from './store';
import LoginPage from './components/LoginPage';
import ParentDashboard from './components/ParentDashboard';
import ChildScreen from './components/ChildScreen';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    initializeStore();
    const saved = getCurrentUser();
    if (saved) setUser(saved);
    setLoaded(true);
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setCurrentUser(loggedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="animate-pulse text-2xl text-purple-600">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role === 'parent') {
    return <ParentDashboard user={user} onLogout={handleLogout} />;
  }

  return <ChildScreen user={user} onLogout={handleLogout} />;
}
