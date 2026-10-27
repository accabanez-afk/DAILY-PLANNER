export type GenderOption = 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say' | 'Other';

export type GradeLevel =
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9'
  | 'Grade 10'
  | 'Grade 11'
  | 'Grade 12';

export type StrandOption =
  | 'N/A'
  | 'STEM'
  | 'ABM'
  | 'HUMSS'
  | 'GAS'
  | 'TVL-ICT'
  | 'TVL-HE'
  | 'TVL-IA'
  | 'Arts and Design'
  | 'Sports'
  | 'General Academic';

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  gender: GenderOption;
  address: string;
  grade: GradeLevel;
  strand: StrandOption;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  category?: string; // Subject e.g. Mathematics, Science, English, etc.
  priority?: TaskPriority;
  status: TaskStatus;
  hasAlarm?: boolean;
  alarmOffsetMinutes?: number; // 0 = at time, 5, 10, 15, 30, 60
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveAlarm {
  task: TaskItem;
  triggeredAt: number;
}
