export interface User {
  id: string;
  name: string;
  role: 'parent' | 'child';
  password: string;
  avatar: string; // emoji for children
}

export interface Task {
  id: string;
  title: string;
  points: number;
  createdBy: string; // parent id
  createdAt: string;
}

export interface DailyAssignment {
  id: string;
  childId: string;
  taskId: string;
  taskTitle: string;
  taskPoints: number;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
}

export interface Penalty {
  id: string;
  childId: string;
  points: number;
  date: string;
  reason: string;
  createdAt: string;
}

export interface RewardThreshold {
  points: number;
  amount: number; // in rubles
}

export interface AppSettings {
  adminLogin: string;
  adminPassword: string;
  rewards: RewardThreshold[];
}

export interface WeeklyResult {
  childId: string;
  weekStart: string; // Monday date
  weekEnd: string; // Friday date
  totalPoints: number;
  completedTasks: number;
  totalTasks: number;
  penalties: number;
  reward: number;
}

export const ANIMALS = [
  { emoji: '🐰', name: 'Заяц', goal: '🥕' },
  { emoji: '🐺', name: 'Волк', goal: '🥩' },
  { emoji: '🐢', name: 'Черепаха', goal: '🌿' },
  { emoji: '🐿️', name: 'Белка', goal: '🌰' },
  { emoji: '🐻', name: 'Медведь', goal: '🍯' },
  { emoji: '🦊', name: 'Лиса', goal: '🍇' },
  { emoji: '🐧', name: 'Пингвин', goal: '🐟' },
  { emoji: '🦁', name: 'Лев', goal: '👑' },
];
