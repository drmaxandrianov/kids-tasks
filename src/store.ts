import { User, Task, DailyAssignment, Penalty, AppSettings, WeeklyResult } from './types';

const STORAGE_KEYS = {
  USERS: 'homework_users',
  TASKS: 'homework_tasks',
  ASSIGNMENTS: 'homework_assignments',
  PENALTIES: 'homework_penalties',
  SETTINGS: 'homework_settings',
  CURRENT_USER: 'homework_current_user',
  CHILD_AVATARS: 'homework_child_avatars',
};

function get<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function set(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize default settings
export function initializeStore(): void {
  const settings = get<AppSettings>(STORAGE_KEYS.SETTINGS, {
    adminLogin: 'admin',
    adminPassword: 'admin',
    rewards: [
      { points: 50, amount: 100 },
      { points: 100, amount: 250 },
      { points: 150, amount: 500 },
    ],
  });
  set(STORAGE_KEYS.SETTINGS, settings);
}

// Users
export function getUsers(): User[] {
  return get<User[]>(STORAGE_KEYS.USERS, []);
}

export function saveUsers(users: User[]): void {
  set(STORAGE_KEYS.USERS, users);
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function updateUser(user: User): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    users[idx] = user;
    saveUsers(users);
  }
}

export function deleteUser(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);
  // Also clean up assignments and penalties
  const assignments = getAssignments().filter(a => a.childId !== userId);
  set(STORAGE_KEYS.ASSIGNMENTS, assignments);
  const penalties = getPenalties().filter(p => p.childId !== userId);
  set(STORAGE_KEYS.PENALTIES, penalties);
}

export function authenticate(login: string, password: string): User | null {
  const settings = getSettings();
  if (login === settings.adminLogin && password === settings.adminPassword) {
    return { id: 'admin', name: 'Родитель', role: 'parent', password: '', avatar: '' };
  }
  const users = getUsers();
  const user = users.find(u => u.role === 'child' && u.name.toLowerCase() === login.toLowerCase() && u.password === password);
  return user || null;
}

// Current user session
export function setCurrentUser(user: User | null): void {
  if (user) {
    set(STORAGE_KEYS.CURRENT_USER, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function getCurrentUser(): User | null {
  return get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

// Tasks (library)
export function getTasks(): Task[] {
  return get<Task[]>(STORAGE_KEYS.TASKS, []);
}

export function saveTasks(tasks: Task[]): void {
  set(STORAGE_KEYS.TASKS, tasks);
}

export function addTask(task: Task): void {
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
}

export function deleteTask(taskId: string): void {
  const tasks = getTasks().filter(t => t.id !== taskId);
  saveTasks(tasks);
}

// Assignments
export function getAssignments(): DailyAssignment[] {
  return get<DailyAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
}

export function saveAssignments(assignments: DailyAssignment[]): void {
  set(STORAGE_KEYS.ASSIGNMENTS, assignments);
}

export function addAssignment(assignment: DailyAssignment): void {
  const assignments = getAssignments();
  assignments.push(assignment);
  saveAssignments(assignments);
}

export function updateAssignment(assignment: DailyAssignment): void {
  const assignments = getAssignments();
  const idx = assignments.findIndex(a => a.id === assignment.id);
  if (idx !== -1) {
    assignments[idx] = assignment;
    saveAssignments(assignments);
  }
}

export function deleteAssignment(assignmentId: string): void {
  const assignments = getAssignments().filter(a => a.id !== assignmentId);
  saveAssignments(assignments);
}

export function getAssignmentsForChild(childId: string, date: string): DailyAssignment[] {
  return getAssignments().filter(a => a.childId === childId && a.date === date);
}

// Penalties
export function getPenalties(): Penalty[] {
  return get<Penalty[]>(STORAGE_KEYS.PENALTIES, []);
}

export function savePenalties(penalties: Penalty[]): void {
  set(STORAGE_KEYS.PENALTIES, penalties);
}

export function addPenalty(penalty: Penalty): void {
  const penalties = getPenalties();
  penalties.push(penalty);
  savePenalties(penalties);
}

export function deletePenalty(penaltyId: string): void {
  const penalties = getPenalties().filter(p => p.id !== penaltyId);
  savePenalties(penalties);
}

// Settings
export function getSettings(): AppSettings {
  return get<AppSettings>(STORAGE_KEYS.SETTINGS, {
    adminLogin: 'admin',
    adminPassword: 'admin',
    rewards: [
      { points: 50, amount: 100 },
      { points: 100, amount: 250 },
      { points: 150, amount: 500 },
    ],
  });
}

export function saveSettings(settings: AppSettings): void {
  set(STORAGE_KEYS.SETTINGS, settings);
}

// Child avatars
export function getChildAvatars(): Record<string, string> {
  return get<Record<string, string>>(STORAGE_KEYS.CHILD_AVATARS, {});
}

export function setChildAvatar(childId: string, animalEmoji: string): void {
  const avatars = getChildAvatars();
  avatars[childId] = animalEmoji;
  set(STORAGE_KEYS.CHILD_AVATARS, avatars);
}

// Week helpers
export function getWeekDates(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // go to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return { start: monday, end: friday };
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getWeekPointsForChild(childId: string): { earned: number; penalties: number; completed: number; total: number } {
  const { start, end } = getWeekDates();
  const startStr = formatDate(start);
  const endStr = formatDate(end);
  
  const assignments = getAssignments().filter(a => 
    a.childId === childId && a.date >= startStr && a.date <= endStr
  );
  
  const penalties = getPenalties().filter(p => 
    p.childId === childId && p.date >= startStr && p.date <= endStr
  );
  
  const earned = assignments.filter(a => a.completed).reduce((sum, a) => sum + a.taskPoints, 0);
  const penaltyPoints = penalties.reduce((sum, p) => sum + p.points, 0);
  const completed = assignments.filter(a => a.completed).length;
  const total = assignments.length;
  
  return { earned, penalties: penaltyPoints, completed, total };
}

export function getMaxPossiblePointsForChild(childId: string): number {
  const { start, end } = getWeekDates();
  const startStr = formatDate(start);
  const endStr = formatDate(end);
  
  const assignments = getAssignments().filter(a => 
    a.childId === childId && a.date >= startStr && a.date <= endStr
  );
  
  return assignments.reduce((sum, a) => sum + a.taskPoints, 0);
}

export function getWeeklyResults(): WeeklyResult[] {
  const children = getUsers().filter(u => u.role === 'child');
  return children.map(child => {
    const { earned, penalties, completed, total } = getWeekPointsForChild(child.id);
    const settings = getSettings();
    const netPoints = earned - penalties;
    let reward = 0;
    for (const threshold of settings.rewards) {
      if (netPoints >= threshold.points) {
        reward = threshold.amount;
      }
    }
    const { start, end } = getWeekDates();
    return {
      childId: child.id,
      weekStart: formatDate(start),
      weekEnd: formatDate(end),
      totalPoints: netPoints,
      completedTasks: completed,
      totalTasks: total,
      penalties,
      reward,
    };
  });
}

export function getDayName(dateStr: string): string {
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const date = new Date(dateStr + 'T00:00:00');
  return days[date.getDay()];
}

export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}
