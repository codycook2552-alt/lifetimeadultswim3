import { ClassType, LessonSession, Package, Skill, StudentProgress, User, UserRole, FinancialStat } from './types';

export const CURRENT_USER_CLIENT: User = {
  id: 'u1',
  name: 'Sarah Jenkins',
  email: 'sarah@example.com',
  role: UserRole.CLIENT,
  avatarUrl: 'https://picsum.photos/100/100',
  packageCredits: 3
};

export const CURRENT_USER_INSTRUCTOR: User = {
  id: 'i1',
  name: 'Coach Mike',
  email: 'mike@lovableswim.com',
  role: UserRole.INSTRUCTOR,
  avatarUrl: 'https://picsum.photos/101/101'
};

export const CURRENT_USER_ADMIN: User = {
  id: 'a1',
  name: 'Elena Owner',
  email: 'admin@lovableswim.com',
  role: UserRole.ADMIN,
  avatarUrl: 'https://picsum.photos/102/102'
};

export const ALL_USERS: User[] = [
  CURRENT_USER_CLIENT,
  CURRENT_USER_INSTRUCTOR,
  CURRENT_USER_ADMIN
];

export const CLASS_TYPES: ClassType[] = [
  {
    id: 'c1',
    name: 'Beginner Water Comfort',
    description: 'Overcome fear of water and learn basic buoyancy and submersion techniques.',
    priceSingle: 45,
    pricePackage: 200,
    durationMinutes: 45,
    difficulty: 'Beginner'
  },
  {
    id: 'c2',
    name: 'Intermediate Stroke Refinement',
    description: 'Focus on freestyle and backstroke technique, breathing efficiency, and stamina.',
    priceSingle: 55,
    pricePackage: 250,
    durationMinutes: 60,
    difficulty: 'Intermediate'
  },
  {
    id: 'c3',
    name: 'Advanced Endurance & Turns',
    description: 'High-intensity session focusing on flip turns, butterfly stroke, and long-distance pacing.',
    priceSingle: 65,
    pricePackage: 300,
    durationMinutes: 60,
    difficulty: 'Advanced'
  }
];

export const PACKAGES: Package[] = [
  { id: 'p1', name: 'Starter Pack', credits: 5, price: 200, description: 'Perfect for beginners committed to learning.' },
  { id: 'p2', name: 'Pro Pack', credits: 10, price: 380, description: 'Best value for serious swimmers.' }
];

export const SKILLS: Skill[] = [
  { id: 's1', name: 'Face Submersion (5s)', category: 'Comfort' },
  { id: 's2', name: 'Front Float (Unsupported)', category: 'Buoyancy' },
  { id: 's3', name: 'Freestyle Arms', category: 'Strokes' },
  { id: 's4', name: 'Side Breathing', category: 'Strokes' },
  { id: 's5', name: 'Treading Water (1min)', category: 'Safety' },
];

// Mock Sessions for the next few days
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const SESSIONS: LessonSession[] = [
  {
    id: 'sess1',
    classTypeId: 'c1',
    instructorId: 'i1',
    startTime: new Date(today.setHours(16, 0, 0, 0)).toISOString(),
    endTime: new Date(today.setHours(16, 45, 0, 0)).toISOString(),
    capacity: 4,
    enrolledUserIds: ['u1', 'u2', 'u3']
  },
  {
    id: 'sess2',
    classTypeId: 'c2',
    instructorId: 'i1',
    startTime: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(tomorrow.setHours(11, 0, 0, 0)).toISOString(),
    capacity: 6,
    enrolledUserIds: ['u4', 'u5']
  }
];

export const MOCK_STUDENT_PROGRESS: StudentProgress[] = [
  { studentId: 'u1', skillId: 's1', status: 'Achieved', lastUpdated: '2025-11-20' },
  { studentId: 'u1', skillId: 's2', status: 'Working On', lastUpdated: '2025-11-22' },
  { studentId: 'u1', skillId: 's3', status: 'Not Started', lastUpdated: '2025-11-22' },
];

export const ADMIN_STATS: FinancialStat[] = [
  { month: 'Jun', revenue: 4500, lessonsGiven: 120 },
  { month: 'Jul', revenue: 5200, lessonsGiven: 145 },
  { month: 'Aug', revenue: 4800, lessonsGiven: 130 },
  { month: 'Sep', revenue: 6100, lessonsGiven: 160 },
  { month: 'Oct', revenue: 7500, lessonsGiven: 190 },
  { month: 'Nov', revenue: 8200, lessonsGiven: 210 },
];