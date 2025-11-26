
import { ClassType, LessonSession, Package, StudentProgress, User, UserRole, Availability, Blockout, Purchase } from '../types';
import { ALL_USERS, CLASS_TYPES, PACKAGES, SESSIONS, MOCK_STUDENT_PROGRESS } from '../constants';

const STORAGE_KEYS = {
  USERS: 'ls_users',
  CLASSES: 'ls_classes',
  PACKAGES: 'ls_packages',
  SESSIONS: 'ls_sessions',
  PROGRESS: 'ls_progress',
  SETTINGS: 'ls_settings',
  AVAILABILITY: 'ls_availability',
  BLOCKOUTS: 'ls_blockouts',
  PURCHASES: 'ls_purchases'
};

const DEFAULT_AVAILABILITY: Availability[] = [
  { id: 'av1', instructorId: 'i1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Mon
  { id: 'av2', instructorId: 'i1', dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wed
  { id: 'av3', instructorId: 'i1', dayOfWeek: 5, startTime: '09:00', endTime: '16:00' }, // Fri
];

class MockDatabase {
  private users: User[];
  private classes: ClassType[];
  private packages: Package[];
  private sessions: LessonSession[];
  private progress: StudentProgress[];
  private availability: Availability[];
  private blockouts: Blockout[];
  private purchases: Purchase[];
  private settings: any;

  constructor() {
    this.users = this.load(STORAGE_KEYS.USERS, ALL_USERS);
    this.classes = this.load(STORAGE_KEYS.CLASSES, CLASS_TYPES);
    this.packages = this.load(STORAGE_KEYS.PACKAGES, PACKAGES);
    this.sessions = this.load(STORAGE_KEYS.SESSIONS, SESSIONS);
    this.progress = this.load(STORAGE_KEYS.PROGRESS, MOCK_STUDENT_PROGRESS);
    this.availability = this.load(STORAGE_KEYS.AVAILABILITY, DEFAULT_AVAILABILITY);
    this.blockouts = this.load(STORAGE_KEYS.BLOCKOUTS, []);
    this.settings = this.load(STORAGE_KEYS.SETTINGS, {
      poolCapacity: 25,
      cancellationHours: 24,
      maintenanceMode: false,
      contactEmail: 'admin@lovableswim.com'
    });
    // Seed some purchases if empty
    const initialPurchases: Purchase[] = [
      { id: 'pur1', userId: 'u1', packageName: 'Starter Pack', credits: 5, price: 200, date: '2025-10-15T10:00:00Z' }
    ];
    this.purchases = this.load(STORAGE_KEYS.PURCHASES, initialPurchases);
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error('Failed to load from storage', e);
      return defaultValue;
    }
  }

  private save(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to storage', e);
    }
  }

  // --- USERS ---
  getUsers() { return [...this.users]; }

  getUserById(id: string) { return this.users.find(u => u.id === id); }

  authenticate(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User) {
    if (this.users.some(u => u.email === user.email)) {
      throw new Error('User with this email already exists');
    }
    this.users.push(user);
    this.save(STORAGE_KEYS.USERS, this.users);
    return user;
  }

  updateUser(user: User) {
    this.users = this.users.map(u => u.id === user.id ? user : u);
    this.save(STORAGE_KEYS.USERS, this.users);
    return user;
  }

  deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
    this.save(STORAGE_KEYS.USERS, this.users);
  }

  // --- CLASSES ---
  getClasses() { return [...this.classes]; }

  createClass(cls: ClassType) {
    this.classes.push(cls);
    this.save(STORAGE_KEYS.CLASSES, this.classes);
  }

  updateClass(cls: ClassType) {
    this.classes = this.classes.map(c => c.id === cls.id ? cls : c);
    this.save(STORAGE_KEYS.CLASSES, this.classes);
  }

  deleteClass(id: string) {
    this.classes = this.classes.filter(c => c.id !== id);
    this.save(STORAGE_KEYS.CLASSES, this.classes);
  }

  // --- PACKAGES ---
  getPackages() { return [...this.packages]; }

  createPackage(pkg: Package) {
    this.packages.push(pkg);
    this.save(STORAGE_KEYS.PACKAGES, this.packages);
  }

  updatePackage(pkg: Package) {
    this.packages = this.packages.map(p => p.id === pkg.id ? pkg : p);
    this.save(STORAGE_KEYS.PACKAGES, this.packages);
  }

  deletePackage(id: string) {
    this.packages = this.packages.filter(p => p.id !== id);
    this.save(STORAGE_KEYS.PACKAGES, this.packages);
  }

  // --- PURCHASES ---
  getPurchasesForUser(userId: string) {
    return this.purchases.filter(p => p.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  createPurchase(purchase: Purchase) {
    this.purchases.push(purchase);
    this.save(STORAGE_KEYS.PURCHASES, this.purchases);
  }

  // --- SESSIONS ---
  getSessions() { return [...this.sessions]; }

  getSessionsForUser(userId: string) {
    return this.sessions.filter(s => s.enrolledUserIds.includes(userId));
  }

  createSession(session: LessonSession) {
    this.sessions.push(session);
    this.save(STORAGE_KEYS.SESSIONS, this.sessions);
  }

  deleteSession(id: string) {
    const session = this.sessions.find(s => s.id === id);
    if (session) {
      session.enrolledUserIds.forEach(uid => {
        const u = this.users.find(user => user.id === uid);
        if (u && u.role === UserRole.CLIENT) {
          u.packageCredits = (u.packageCredits || 0) + 1;
          this.updateUser(u);
        }
      });
    }
    this.sessions = this.sessions.filter(s => s.id !== id);
    this.save(STORAGE_KEYS.SESSIONS, this.sessions);
  }

  enrollUserInSession(userId: string, sessionId: string) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) throw new Error("Session not found");

    if (session.enrolledUserIds.includes(userId)) return;
    if (session.enrolledUserIds.length >= session.capacity) throw new Error("Class full");

    session.enrolledUserIds.push(userId);
    this.sessions = this.sessions.map(s => s.id === sessionId ? session : s);
    this.save(STORAGE_KEYS.SESSIONS, this.sessions);
  }

  // --- AVAILABILITY ---
  getAvailability(instructorId: string) {
    return this.availability.filter(a => a.instructorId === instructorId);
  }

  createAvailability(avail: Availability) {
    this.availability.push(avail);
    this.save(STORAGE_KEYS.AVAILABILITY, this.availability);
  }

  deleteAvailability(id: string) {
    this.availability = this.availability.filter(a => a.id !== id);
    this.save(STORAGE_KEYS.AVAILABILITY, this.availability);
  }

  // --- BLOCKOUTS ---
  getBlockouts(instructorId: string) {
    return this.blockouts.filter(b => b.instructorId === instructorId);
  }

  createBlockout(blockout: Blockout) {
    this.blockouts.push(blockout);
    this.save(STORAGE_KEYS.BLOCKOUTS, this.blockouts);
  }

  deleteBlockout(id: string) {
    this.blockouts = this.blockouts.filter(b => b.id !== id);
    this.save(STORAGE_KEYS.BLOCKOUTS, this.blockouts);
  }

  // --- PROGRESS ---
  getProgress(studentId: string) {
    return this.progress.filter(p => p.studentId === studentId);
  }

  updateProgress(studentId: string, skillId: string, status: StudentProgress['status']) {
    const existingIndex = this.progress.findIndex(p => p.studentId === studentId && p.skillId === skillId);
    if (existingIndex >= 0) {
      this.progress[existingIndex] = { ...this.progress[existingIndex], status, lastUpdated: new Date().toISOString() };
    } else {
      this.progress.push({ studentId, skillId, status, lastUpdated: new Date().toISOString() });
    }
    this.save(STORAGE_KEYS.PROGRESS, this.progress);
  }

  // --- SETTINGS ---
  getSettings() { return this.settings; }
  saveSettings(settings: any) {
    this.settings = settings;
    this.save(STORAGE_KEYS.SETTINGS, this.settings);
  }
}

export const db = new MockDatabase();
