import { User, Task, DailyAssignment, Penalty, AppSettings } from './types';

export interface AppData {
  users: User[];
  tasks: Task[];
  assignments: DailyAssignment[];
  penalties: Penalty[];
  settings: AppSettings;
  childAvatars: Record<string, string>;
}

const API_BASE = '/api';

export async function fetchData(): Promise<AppData> {
  const res = await fetch(`${API_BASE}/data`);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

export async function saveData(data: AppData): Promise<void> {
  const res = await fetch(`${API_BASE}/data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save data');
}
