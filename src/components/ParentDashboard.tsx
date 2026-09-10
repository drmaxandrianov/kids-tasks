import { useState } from 'react';
import { useApp, ANIMALS } from '../AppContext';
import { Task, RewardThreshold } from '../types';
import {
  LogOut, Users, BookOpen, Calendar, Award, Settings,
  Plus, Trash2, X, CheckCircle, AlertTriangle, Star
} from 'lucide-react';

type Tab = 'children' | 'tasks' | 'assign' | 'penalties' | 'rewards' | 'settings' | 'archive';

function getDayName(dateStr: string): string {
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const date = new Date(dateStr + 'T00:00:00');
  return days[date.getDay()];
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function ParentDashboard() {
  const {
    data, logout, addChild, updateChild, deleteChild,
    addTask, deleteTask, addAssignment, deleteAssignment,
    addPenalty, deletePenalty, updateSettings,
    getWeekPointsForChild, getWeeklyResults, getAssignmentsForDate,
  } = useApp();
  const [tab, setTab] = useState<Tab>('children');

  if (!data) return null;

  const children = data.users.filter(u => u.role === 'child');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'children', label: 'Дети', icon: <Users size={18} /> },
    { key: 'tasks', label: 'Библиотека', icon: <BookOpen size={18} /> },
    { key: 'assign', label: 'Назначить', icon: <Calendar size={18} /> },
    { key: 'penalties', label: 'Штрафы', icon: <AlertTriangle size={18} /> },
    { key: 'rewards', label: 'Награды', icon: <Award size={18} /> },
    { key: 'archive', label: 'Архив', icon: <Star size={18} /> },
    { key: 'settings', label: 'Настройки', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <h1 className="text-lg font-bold text-gray-800">Панель родителя</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-100 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                tab === t.key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'children' && <ChildrenTab />}
        {tab === 'tasks' && <TasksTab />}
        {tab === 'assign' && <AssignTab />}
        {tab === 'penalties' && <PenaltiesTab />}
        {tab === 'rewards' && <RewardsTab />}
        {tab === 'archive' && <ArchiveTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );

  // ===== CHILDREN TAB =====
  function ChildrenTab() {
    const [showForm, setShowForm] = useState(false);
    const [editingChild, setEditingChild] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(ANIMALS[0].emoji);

    const openAdd = () => {
      setEditingChild(null);
      setName('');
      setPassword('');
      setAvatar(ANIMALS[0].emoji);
      setShowForm(true);
    };

    const openEdit = (childId: string) => {
      const child = data!.users.find(u => u.id === childId);
      if (!child) return;
      setEditingChild(childId);
      setName(child.name);
      setPassword(child.password);
      setAvatar(data!.childAvatars[childId] || ANIMALS[0].emoji);
      setShowForm(true);
    };

    const handleSave = () => {
      if (!name.trim()) return;
      if (editingChild) {
        updateChild(editingChild, name.trim(), password, avatar);
      } else {
        addChild(name.trim(), password, avatar);
      }
      setShowForm(false);
    };

    const handleDelete = (childId: string) => {
      const child = data!.users.find(u => u.id === childId);
      if (confirm(`Удалить ребёнка "${child?.name}"? Все данные будут потеряны.`)) {
        deleteChild(childId);
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Дети</h2>
          <button
            onClick={openAdd}
            className="bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-600 transition"
          >
            <Plus size={18} />
            Добавить
          </button>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">👶</div>
            <p>Добавьте первого ребёнка</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map(child => {
              const { earned, penalties } = getWeekPointsForChild(child.id);
              const childAvatar = data!.childAvatars[child.id] || '🐰';
              return (
                <div key={child.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{childAvatar}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{child.name}</h3>
                      <p className="text-sm text-gray-500">Логин: {child.name.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm mb-4">
                    <span className="text-green-600">+{earned} баллов</span>
                    <span className="text-red-500">-{penalties} штраф</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(child.id)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-100 transition"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(child.id)}
                      className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{editingChild ? 'Редактировать' : 'Добавить'} ребёнка</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
                    placeholder="Имя ребёнка"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Пароль для входа</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
                    placeholder="Пароль"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Персонаж</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ANIMALS.map(a => (
                      <button
                        key={a.emoji}
                        onClick={() => setAvatar(a.emoji)}
                        className={`p-3 rounded-xl text-center transition ${
                          avatar === a.emoji
                            ? 'bg-purple-100 border-2 border-purple-400'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-2xl">{a.emoji}</div>
                        <div className="text-xs text-gray-500 mt-1">{a.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className="w-full bg-purple-500 text-white py-3 rounded-xl font-medium hover:bg-purple-600 transition"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== TASKS TAB =====
  function TasksTab() {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [points, setPoints] = useState(5);

    const handleSave = () => {
      if (!title.trim()) return;
      addTask(title.trim(), points);
      setTitle('');
      setPoints(5);
      setShowForm(false);
    };

    const handleDelete = (taskId: string) => {
      if (confirm('Удалить задание из библиотеки?')) {
        deleteTask(taskId);
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Библиотека заданий</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-600 transition"
          >
            <Plus size={18} />
            Новое задание
          </button>
        </div>

        {data!.tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">📝</div>
            <p>Добавьте задания в библиотеку</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {data!.tasks.map(task => (
              <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">{task.title}</h4>
                  <span className="text-sm text-purple-600 font-medium">{task.points} баллов</span>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-400 hover:text-red-600 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Новое задание</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
                    placeholder="Например: Почистить зубы"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Баллы</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    min={1}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="w-full bg-purple-500 text-white py-3 rounded-xl font-medium hover:bg-purple-600 transition"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== ASSIGN TAB =====
  function AssignTab() {
    const [selectedChild, setSelectedChild] = useState(children[0]?.id || '');
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newPoints, setNewPoints] = useState(5);
    const [selectedTaskId, setSelectedTaskId] = useState('');

    const todayAssignments = selectedChild
      ? getAssignmentsForDate(selectedChild, selectedDate)
      : [];

    const handleAddFromLibrary = () => {
      if (!selectedTaskId || !selectedChild) return;
      const task = data!.tasks.find(t => t.id === selectedTaskId);
      if (!task) return;
      addAssignment(selectedChild, task.id, task.title, task.points, selectedDate);
      setSelectedTaskId('');
    };

    const handleAddNew = () => {
      if (!newTitle.trim() || !selectedChild) return;
      addTask(newTitle.trim(), newPoints);
      // Find the newly created task (last one)
      const tasks = data!.tasks;
      const lastTask = tasks[tasks.length - 1];
      if (lastTask) {
        addAssignment(selectedChild, lastTask.id, lastTask.title, lastTask.points, selectedDate);
      }
      setNewTitle('');
      setNewPoints(5);
      setShowForm(false);
    };

    const handleDeleteAssignment = (id: string) => {
      deleteAssignment(id);
    };

    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Назначить задания</h2>

        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ребёнок</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
            />
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {getDayName(selectedDate)}, {selectedDate}
        </div>

        {todayAssignments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Задания на этот день:</h3>
            <div className="space-y-2">
              {todayAssignments.map(a => (
                <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {a.completed ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className="text-gray-800">{a.taskTitle}</span>
                    <span className="text-sm text-purple-600 font-medium">{a.taskPoints}б</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAssignment(a.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <h3 className="font-medium text-gray-700 mb-3">Добавить из библиотеки</h3>
          <div className="flex gap-2">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
            >
              <option value="">Выберите задание...</option>
              {data!.tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.points}б)</option>
              ))}
            </select>
            <button
              onClick={handleAddFromLibrary}
              disabled={!selectedTaskId}
              className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition disabled:opacity-50"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl p-4 text-gray-500 hover:border-purple-400 hover:text-purple-500 transition flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Создать новое задание
          </button>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-700 mb-3">Новое задание</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
                placeholder="Название задания"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  min={1}
                  className="w-32 px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
                  placeholder="Баллы"
                />
                <button
                  onClick={handleAddNew}
                  className="bg-purple-500 text-white px-6 py-2 rounded-xl hover:bg-purple-600 transition"
                >
                  Добавить
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-200 transition"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== PENALTIES TAB =====
  function PenaltiesTab() {
    const [selectedChild, setSelectedChild] = useState(children[0]?.id || '');
    const [points, setPoints] = useState(5);
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(getToday());

    const childPenalties = data!.penalties.filter(p => p.childId === selectedChild);

    const handleAdd = () => {
      if (!selectedChild || !reason.trim()) return;
      addPenalty(selectedChild, points, reason.trim(), date);
      setReason('');
      setPoints(5);
    };

    const handleDelete = (id: string) => {
      deletePenalty(id);
    };

    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Штрафы</h2>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ребёнок</label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
              >
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Баллы (вычет)</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Причина</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
                placeholder="Причина штрафа"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="mt-4 bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition flex items-center gap-2"
          >
            <AlertTriangle size={18} />
            Назначить штраф
          </button>
        </div>

        {childPenalties.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3">История штрафов:</h3>
            <div className="space-y-2">
              {childPenalties.map(p => (
                <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold">
                        -{p.points}
                      </span>
                      <span className="text-gray-800">{p.reason}</span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{p.date}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== REWARDS TAB =====
  function RewardsTab() {
    const [rewards, setRewards] = useState<RewardThreshold[]>(data!.settings.rewards);

    const handleAdd = () => {
      setRewards([...rewards, { points: 0, amount: 0 }]);
    };

    const handleUpdate = (idx: number, field: 'points' | 'amount', value: number) => {
      const newRewards = [...rewards];
      newRewards[idx] = { ...newRewards[idx], [field]: value };
      setRewards(newRewards);
    };

    const handleRemove = (idx: number) => {
      setRewards(rewards.filter((_, i) => i !== idx));
    };

    const handleSave = () => {
      const sorted = [...rewards].sort((a, b) => a.points - b.points);
      updateSettings({ ...data!.settings, rewards: sorted });
      alert('Награды сохранены!');
    };

    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Градация наград</h2>
        <p className="text-gray-500 mb-6">
          Настройте пороги баллов и соответствующие денежные награды (в рублях).
        </p>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center text-sm font-medium text-gray-500">
              <span>Порог баллов</span>
              <span>Награда (₽)</span>
              <span></span>
            </div>
            {rewards.map((r, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                <input
                  type="number"
                  value={r.points}
                  onChange={(e) => handleUpdate(idx, 'points', Number(e.target.value))}
                  min={0}
                  className="px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
                />
                <input
                  type="number"
                  value={r.amount}
                  onChange={(e) => handleUpdate(idx, 'amount', Number(e.target.value))}
                  min={0}
                  className="px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
                />
                <button
                  onClick={() => handleRemove(idx)}
                  className="text-red-400 hover:text-red-600 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
            >
              <Plus size={16} />
              Добавить порог
            </button>
            <button
              onClick={handleSave}
              className="bg-purple-500 text-white px-6 py-2 rounded-xl hover:bg-purple-600 transition"
            >
              Сохранить
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200">
          <h3 className="font-medium text-gray-800 mb-3">🏆 Текущие результаты недели:</h3>
          {getWeeklyResults().map(r => {
            const child = children.find(c => c.id === r.childId);
            return (
              <div key={r.childId} className="flex items-center justify-between py-2 border-b border-yellow-100 last:border-0">
                <span className="font-medium">{child?.name}</span>
                <div className="text-right">
                  <span className="text-purple-600 font-bold">{r.totalPoints} баллов</span>
                  {r.reward > 0 && (
                    <span className="ml-3 text-green-600 font-bold">{r.reward} ₽</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== ARCHIVE TAB =====
  function ArchiveTab() {
    const [selectedChild, setSelectedChild] = useState(children[0]?.id || '');
    const assignments = data!.assignments.filter(a => a.childId === selectedChild);
    const penalties = data!.penalties.filter(p => p.childId === selectedChild);
    const dates = [...new Set(assignments.map(a => a.date))].sort().reverse();

    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Архив заданий</h2>

        <div className="mb-6">
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
          >
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {dates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">📂</div>
            <p>Архив пуст</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dates.map(date => {
              const dayAssignments = assignments.filter(a => a.date === date);
              const dayPenalties = penalties.filter(p => p.date === date);
              const earned = dayAssignments.filter(a => a.completed).reduce((s, a) => s + a.taskPoints, 0);
              const penaltyPoints = dayPenalties.reduce((s, p) => s + p.points, 0);
              return (
                <div key={date} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">
                      {getDayName(date)}, {date}
                    </h4>
                    <div className="flex gap-3 text-sm">
                      <span className="text-green-600">+{earned}б</span>
                      {penaltyPoints > 0 && <span className="text-red-500">-{penaltyPoints}б</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dayAssignments.map(a => (
                      <div key={a.id} className="flex items-center gap-2 text-sm">
                        {a.completed ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className={a.completed ? 'text-gray-500 line-through' : 'text-gray-700'}>
                          {a.taskTitle}
                        </span>
                        <span className="text-purple-500 text-xs">{a.taskPoints}б</span>
                      </div>
                    ))}
                    {dayPenalties.map(p => (
                      <div key={p.id} className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-xs font-bold">
                          -{p.points}
                        </span>
                        <span className="text-gray-700">{p.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ===== SETTINGS TAB =====
  function SettingsTab() {
    const [loginVal, setLoginVal] = useState(data!.settings.adminLogin);
    const [passwordVal, setPasswordVal] = useState(data!.settings.adminPassword);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
      if (!loginVal.trim() || !passwordVal.trim()) return;
      updateSettings({ ...data!.settings, adminLogin: loginVal.trim(), adminPassword: passwordVal.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };

    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Настройки</h2>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 max-w-md">
          <h3 className="font-medium text-gray-700 mb-4">Данные для входа родителя</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
              <input
                type="text"
                value={loginVal}
                onChange={(e) => setLoginVal(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input
                type="text"
                value={passwordVal}
                onChange={(e) => setPasswordVal(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 outline-none"
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-purple-500 text-white px-6 py-2 rounded-xl hover:bg-purple-600 transition"
            >
              {saved ? '✓ Сохранено!' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
