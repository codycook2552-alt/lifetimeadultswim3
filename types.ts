
export enum UserRole {
  CLIENT = 'CLIENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
  packageCredits?: number; // For clients
}

export interface ClassType {
  id: string;
  name: string;
  description: string;
  priceSingle: number;
  pricePackage: number;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface LessonSession {
  id: string;
  classTypeId: string;
  instructorId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  capacity: number;
  enrolledUserIds: string[];
}

export interface Availability {
  id: string;
  instructorId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface Blockout {
  id: string;
  instructorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  reason: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface StudentProgress {
  studentId: string;
  skillId: string;
  status: 'Not Started' | 'Working On' | 'Achieved';
  lastUpdated: string;
}

export interface Package {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;

}

export interface Purchase {
  id: string;
  userId: string;
  packageName: string;
  credits: number;
  price: number;
  date: string; // ISO
}

// Stats for Admin
export interface FinancialStat {
  month: string;
  revenue: number;
  lessonsGiven: number;
}
