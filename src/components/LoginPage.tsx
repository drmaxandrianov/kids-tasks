import { useState } from 'react';
import { useApp } from '../AppContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = login(username, password);
    if (!user) {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-800">Домашние задания</h1>
          <p className="text-gray-500 mt-2">Войдите в систему</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition"
              placeholder="Введите логин"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition"
              placeholder="Введите пароль"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-purple-600 hover:to-blue-600 transition shadow-lg shadow-purple-200"
          >
            <LogIn size={20} />
            Войти
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Родитель: логин admin, пароль admin</p>
          <p className="mt-1">Дети: логин = имя, пароль задаёт родитель</p>
        </div>
      </div>
    </div>
  );
}
