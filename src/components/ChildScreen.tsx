import { useState, useEffect } from 'react';
import { User, ANIMALS } from '../types';
import {
  getAssignmentsForChild,
  updateAssignment,
  getPenalties,
  getWeekPointsForChild,
  getMaxPossiblePointsForChild,
  getChildAvatars,
  getSettings,
  getToday,
  getDayName,
  getWeekDates,
  formatDate,
} from '../store';
import { LogOut, CheckCircle, Star } from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function ChildScreen({ user, onLogout }: Props) {
  const [assignments, setAssignments] = useState<ReturnType<typeof getAssignmentsForChild>>([]);
  const [penalties, setPenalties] = useState<ReturnType<typeof getPenalties>>([]);
  const [weekPoints, setWeekPoints] = useState({ earned: 0, penalties: 0, completed: 0, total: 0 });
  const [maxPoints, setMaxPoints] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const today = getToday();

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = () => {
    const todayAssignments = getAssignmentsForChild(user.id, today);
    setAssignments(todayAssignments);
    // Show only this week's penalties
    const { start, end } = getWeekDates();
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    setPenalties(getPenalties().filter(p => 
      p.childId === user.id && p.date >= startStr && p.date <= endStr
    ));
    setWeekPoints(getWeekPointsForChild(user.id));
    setMaxPoints(getMaxPossiblePointsForChild(user.id));
  };

  const handleComplete = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment || assignment.completed) return;
    
    const updated = { ...assignment, completed: true, completedAt: new Date().toISOString() };
    updateAssignment(updated);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1500);
    loadData();
  };

  const avatars = getChildAvatars();
  const animalEmoji = avatars[user.id] || '🐰';
  const animal = ANIMALS.find(a => a.emoji === animalEmoji) || ANIMALS[0];
  
  const netPoints = weekPoints.earned - weekPoints.penalties;
  const effectiveMax = maxPoints > 0 ? maxPoints : 100;
  const progress = Math.min(netPoints / effectiveMax, 1);
  
  const settings = getSettings();
  const currentReward = [...settings.rewards]
    .sort((a, b) => b.points - a.points)
    .find(r => netPoints >= r.points);

  const dayName = getDayName(today);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-green-50 relative overflow-hidden">
      {/* Celebration effect */}
      {celebrate && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">⭐</div>
          <div className="absolute text-4xl animate-ping opacity-50">✨</div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{animal.emoji}</span>
            <span className="font-bold text-gray-800">{user.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-red-500 transition p-2"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 pb-8">
        {/* Day */}
        <div className="text-center mb-2">
          <p className="text-sm text-gray-500">{today}</p>
          <h2 className="text-xl font-bold text-gray-800">{dayName}</h2>
        </div>

        {/* Points */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow-sm">
            <Star size={24} className="text-yellow-400 fill-yellow-400" />
            <span className="text-2xl font-bold text-purple-600">{netPoints}</span>
            <span className="text-gray-400">/ {effectiveMax} баллов</span>
          </div>
        </div>

        {/* Progress bar with animal */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div className="relative">
            {/* Track */}
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(progress * 100, 2)}%` }}
              />
            </div>
            
            {/* Animal on progress */}
            <div
              className="absolute -top-8 transition-all duration-700 ease-out"
              style={{ left: `calc(${Math.max(progress * 100, 2)}% - 20px)` }}
            >
              <span className="text-3xl drop-shadow-md">{animal.emoji}</span>
            </div>

            {/* Goal */}
            <div className="absolute -top-8 right-0">
              <span className="text-2xl">{animal.goal}</span>
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Старт</span>
              <span>Цель: {effectiveMax}б</span>
            </div>
          </div>

          {/* Reward info */}
          {currentReward && (
            <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 text-center border border-yellow-200">
              <span className="text-sm text-gray-600">🎉 Награда: </span>
              <span className="font-bold text-green-600">{currentReward.amount} ₽</span>
              <span className="text-sm text-gray-500"> (за {currentReward.points} баллов)</span>
            </div>
          )}
        </div>

        {/* Penalties (splats) */}
        {penalties.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Штрафы:</h3>
            <div className="flex flex-wrap gap-2">
              {penalties.map(p => (
                <div
                  key={p.id}
                  className="relative group"
                  title={p.reason}
                >
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                    {/* Ink splatter effect */}
                    <div className="absolute inset-0 bg-gray-800 rounded-full" style={{
                      clipPath: 'polygon(50% 0%, 61% 11%, 75% 5%, 78% 20%, 95% 25%, 88% 40%, 100% 50%, 88% 60%, 95% 75%, 78% 80%, 75% 95%, 61% 89%, 50% 100%, 39% 89%, 25% 95%, 22% 80%, 5% 75%, 12% 60%, 0% 50%, 12% 40%, 5% 25%, 22% 20%, 25% 5%, 39% 11%)'
                    }} />
                    <span className="relative text-white text-xs font-bold z-10">-{p.points}</span>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                    {p.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Задания на сегодня</h3>
          
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white rounded-2xl">
              <div className="text-4xl mb-3">🌟</div>
              <p>На сегодня заданий нет</p>
              <p className="text-sm mt-1">Отдыхай!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map(assignment => (
                <button
                  key={assignment.id}
                  onClick={() => handleComplete(assignment.id)}
                  disabled={assignment.completed}
                  className={`w-full text-left rounded-2xl p-4 shadow-sm transition-all duration-300 ${
                    assignment.completed
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-white border-2 border-gray-100 hover:border-purple-300 hover:shadow-md active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      assignment.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-100 text-purple-500'
                    }`}>
                      {assignment.completed ? (
                        <CheckCircle size={20} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-purple-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`font-medium ${
                        assignment.completed ? 'text-green-700 line-through' : 'text-gray-800'
                      }`}>
                        {assignment.taskTitle}
                      </span>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      assignment.completed
                        ? 'bg-green-200 text-green-700'
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      +{assignment.taskPoints}б
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Week summary */}
        <div className="mt-6 bg-white/60 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-500">
            Выполнено: {weekPoints.completed} из {weekPoints.total} заданий за неделю
          </p>
          <div className="flex justify-center gap-4 mt-2 text-sm">
            <span className="text-green-600">Заработано: {weekPoints.earned}б</span>
            {weekPoints.penalties > 0 && (
              <span className="text-red-500">Штрафы: -{weekPoints.penalties}б</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
