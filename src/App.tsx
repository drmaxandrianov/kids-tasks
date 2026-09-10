import { AppProvider, useApp } from './AppContext';
import LoginPage from './components/LoginPage';
import ParentDashboard from './components/ParentDashboard';
import ChildScreen from './components/ChildScreen';

function AppContent() {
  const { currentUser, loading, error } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">📚</div>
          <div className="text-xl text-purple-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ошибка подключения</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-500 text-white px-6 py-2 rounded-xl hover:bg-purple-600 transition"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  if (currentUser.role === 'parent') {
    return <ParentDashboard />;
  }

  return <ChildScreen />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
