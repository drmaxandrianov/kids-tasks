import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Task, DailyAssignment, Penalty, AppSettings, ANIMALS } from './types';
import { AppData, fetchData, saveData } from './api';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  data: AppData | null;
  loading: boolean;
  error: string | null;
  // Auth
  currentUser: User | null;
  login: (username: string, password: string) => User | null;
  logout: () => void;
  // Users
  addChild: (name: string, password: string, avatar: string) => void;
  updateChild: (id: string, name: string, password: string, avatar: string) => void;
  deleteChild: (id: string) => void;
  // Tasks
  addTask: (title: string, points: number) => void;
  deleteTask: (id: string) => void;
  // Assignments
  addAssignment: (childId: string, taskId: string, taskTitle: string, taskPoints: number, date: string) => void;
  deleteAssignment: (id: string) => void;
  completeAssignment: (id: string) => void;
  // Penalties
  addPenalty: (childId: string, points: number, reason: string, date: string) => void;
  deletePenalty: (id: string) => void;
  // Settings
  updateSettings: (settings: AppSettings) => void;
  // Helpers
  getWeekPointsForChild: (childId: string) => { earned: number; penalties: number; completed: number; total: number };
  getMaxPossiblePointsForChild: (childId: string) => number;
  getAssignmentsForDate: (childId: string, date: string) => DailyAssignment[];
  getPenaltiesForWeek: (childId: string) => Penalty[];
  getWeeklyResults: () => Array<{ childId: string; totalPoints: number; completedTasks: number; totalTasks: number; penalties: number; reward: number }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedData = await fetchData();
      setData(fetchedData);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить данные');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (newData: AppData) => {
    setData(newData);
    try {
      await saveData(newData);
    } catch (err) {
      console.error('Failed to save data:', err);
      setError('Не удалось сохранить данные');
    }
  };

  // Auth
  const login = (username: string, password: string): User | null => {
    if (!data) return null;
    
    if (username === data.settings.adminLogin && password === data.settings.adminPassword) {
      const admin: User = { id: 'admin', name: 'Родитель', role: 'parent', password: '', avatar: '' };
      setCurrentUser(admin);
      localStorage.setItem('currentUser', JSON.stringify(admin));
      return admin;
    }
    
    const user = data.users.find(u => 
      u.role === 'child' && 
      u.name.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Users
  const addChild = (name: string, password: string, avatar: string) => {
    if (!data) return;
    const newUser: User = { id: uuidv4(), name, role: 'child', password, avatar };
    const newData = {
      ...data,
      users: [...data.users, newUser],
      childAvatars: { ...data.childAvatars, [newUser.id]: avatar },
    };
    updateData(newData);
  };

  const updateChild = (id: string, name: string, password: string, avatar: string) => {
    if (!data) return;
    const newData = {
      ...data,
      users: data.users.map(u => u.id === id ? { ...u, name, password } : u),
      childAvatars: { ...data.childAvatars, [id]: avatar },
    };
    updateData(newData);
  };

  const deleteChild = (id: string) => {
    if (!data) return;
    const newData = {
      ...data,
      users: data.users.filter(u => u.id !== id),
      assignments: data.assignments.filter(a => a.childId !== id),
      penalties: data.penalties.filter(p => p.childId !== id),
      childAvatars: { ...data.childAvatars },
    };
    delete newData.childAvatars[id];
    updateData(newData);
  };

  // Tasks
  const addTask = (title: string, points: number) => {
    if (!data) return;
    const newTask: Task = {
      id: uuidv4(),
      title,
      points,
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
    };
    const newData = { ...data, tasks: [...data.tasks, newTask] };
    updateData(newData);
  };

  const deleteTask = (id: string) => {
    if (!data) return;
    const newData = { ...data, tasks: data.tasks.filter(t => t.id !== id) };
    updateData(newData);
  };

  // Assignments
  const addAssignment = (childId: string, taskId: string, taskTitle: string, taskPoints: number, date: string) => {
    if (!data) return;
    const newAssignment: DailyAssignment = {
      id: uuidv4(),
      childId,
      taskId,
      taskTitle,
      taskPoints,
      date,
      completed: false,
    };
    const newData = { ...data, assignments: [...data.assignments, newAssignment] };
    updateData(newData);
  };

  const deleteAssignment = (id: string) => {
    if (!data) return;
    const newData = { ...data, assignments: data.assignments.filter(a => a.id !== id) };
    updateData(newData);
  };

  const completeAssignment = (id: string) => {
    if (!data) return;
    const newData = {
      ...data,
      assignments: data.assignments.map(a => 
        a.id === id ? { ...a, completed: true, completedAt: new Date().toISOString() } : a
      ),
    };
    updateData(newData);
  };

  // Penalties
  const addPenalty = (childId: string, points: number, reason: string, date: string) => {
    if (!data) return;
    const newPenalty: Penalty = {
      id: uuidv4(),
      childId,
      points,
      date,
      reason,
      createdAt: new Date().toISOString(),
    };
    const newData = { ...data, penalties: [...data.penalties, newPenalty] };
    updateData(newData);
  };

  const deletePenalty = (id: string) => {
    if (!data) return;
    const newData = { ...data, penalties: data.penalties.filter(p => p.id !== id) };
    updateData(newData);
  };

  // Settings
  const updateSettings = (settings: AppSettings) => {
    if (!data) return;
    const newData = { ...data, settings };
    updateData(newData);
  };

  // Helpers
  const getWeekDates = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    return { start: monday, end: friday };
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const getWeekPointsForChild = (childId: string) => {
    if (!data) return { earned: 0, penalties: 0, completed: 0, total: 0 };
    const { start, end } = getWeekDates();
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    
    const assignments = data.assignments.filter(a => 
      a.childId === childId && a.date >= startStr && a.date <= endStr
    );
    const penalties = data.penalties.filter(p => 
      p.childId === childId && p.date >= startStr && p.date <= endStr
    );
    
    const earned = assignments.filter(a => a.completed).reduce((sum, a) => sum + a.taskPoints, 0);
    const penaltyPoints = penalties.reduce((sum, p) => sum + p.points, 0);
    const completed = assignments.filter(a => a.completed).length;
    const total = assignments.length;
    
    return { earned, penalties: penaltyPoints, completed, total };
  };

  const getMaxPossiblePointsForChild = (childId: string) => {
    if (!data) return 0;
    const { start, end } = getWeekDates();
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    
    const assignments = data.assignments.filter(a => 
      a.childId === childId && a.date >= startStr && a.date <= endStr
    );
    
    return assignments.reduce((sum, a) => sum + a.taskPoints, 0);
  };

  const getAssignmentsForDate = (childId: string, date: string) => {
    if (!data) return [];
    return data.assignments.filter(a => a.childId === childId && a.date === date);
  };

  const getPenaltiesForWeek = (childId: string) => {
    if (!data) return [];
    const { start, end } = getWeekDates();
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    return data.penalties.filter(p => 
      p.childId === childId && p.date >= startStr && p.date <= endStr
    );
  };

  const getWeeklyResults = () => {
    if (!data) return [];
    const children = data.users.filter(u => u.role === 'child');
    return children.map(child => {
      const { earned, penalties, completed, total } = getWeekPointsForChild(child.id);
      const netPoints = earned - penalties;
      let reward = 0;
      for (const threshold of data.settings.rewards) {
        if (netPoints >= threshold.points) {
          reward = threshold.amount;
        }
      }
      return {
        childId: child.id,
        totalPoints: netPoints,
        completedTasks: completed,
        totalTasks: total,
        penalties,
        reward,
      };
    });
  };

  return (
    <AppContext.Provider value={{
      data,
      loading,
      error,
      currentUser,
      login,
      logout,
      addChild,
      updateChild,
      deleteChild,
      addTask,
      deleteTask,
      addAssignment,
      deleteAssignment,
      completeAssignment,
      addPenalty,
      deletePenalty,
      updateSettings,
      getWeekPointsForChild,
      getMaxPossiblePointsForChild,
      getAssignmentsForDate,
      getPenaltiesForWeek,
      getWeeklyResults,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export { ANIMALS };
