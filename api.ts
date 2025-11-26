import { supabase } from './supabase';
import { User, UserRole, ClassType, LessonSession, Package, Purchase, Availability, Blockout } from '../types';

export const api = {
    // --- USERS ---
    async getUsers(): Promise<User[]> {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        return data.map(p => ({
            id: p.id,
            email: p.email,
            name: p.full_name,
            role: p.role as UserRole,
            avatarUrl: p.avatar_url,
            packageCredits: p.package_credits
        }));
    },

    async getUserById(id: string): Promise<User | undefined> {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) return undefined;
        return {
            id: data.id,
            email: data.email,
            name: data.full_name,
            role: data.role as UserRole,
            avatarUrl: data.avatar_url,
            packageCredits: data.package_credits
        };
    },

    async updateUser(user: Partial<User> & { id: string }) {
        const updates: any = {};
        if (user.name) updates.full_name = user.name;
        if (user.role) updates.role = user.role;
        if (user.packageCredits !== undefined) updates.package_credits = user.packageCredits;
        // Email update is complex in Supabase, skipping for now or just updating profile if separate

        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
        if (error) throw error;
    },

    async createUser(user: User) {
        // Admin creating user. Supabase Auth Admin API is needed for this usually, 
        // or we just create a profile if we don't need them to login yet?
        // For this demo, we'll assume we can't create Auth users from client easily without Admin key.
        // We'll just throw for now or simulate.
        // actually, we can use a function or just warn.
        console.warn("Creating users via Admin portal requires Supabase Admin API. Skipping Auth creation.");
        // We can insert into profiles if we generate a fake ID, but that breaks FK.
        // Let's assume we just invite them?
        // For the purpose of this refactor, I'll add a placeholder.
        throw new Error("Admin user creation requires backend function");
    },

    async deleteUser(id: string) {
        // Requires Admin API to delete from auth.users.
        // We can delete from profiles if cascade is set?
        // RLS prevents this usually.
        console.warn("Deleting users requires Admin API");
    },

    // --- AUTH ---
    async signUp(email: string, password: string, fullName: string, role: UserRole = UserRole.CLIENT) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                    avatar_url: `https://ui-avatars.com/api/?name=${fullName}&background=random`
                }
            }
        });
        if (error) throw error;
        return data.user;
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data.user;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return {
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            role: profile.role as UserRole,
            avatarUrl: profile.avatar_url,
            packageCredits: profile.package_credits
        };
    },

    // --- CLASSES ---
    async getClasses(): Promise<ClassType[]> {
        const { data, error } = await supabase.from('class_types').select('*');
        if (error) throw error;
        return data.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            durationMinutes: c.duration_minutes,
            priceSingle: c.price,
            pricePackage: c.price,
            difficulty: 'Beginner',
            capacity: c.capacity
        }));
    },

    async createClass(cls: ClassType) {
        const { error } = await supabase.from('class_types').insert({
            name: cls.name,
            description: cls.description,
            duration_minutes: cls.durationMinutes,
            capacity: cls.capacity || 10,
            price: cls.priceSingle
        });
        if (error) throw error;
    },

    async updateClass(cls: ClassType) {
        const { error } = await supabase.from('class_types').update({
            name: cls.name,
            description: cls.description,
            duration_minutes: cls.durationMinutes,
            price: cls.priceSingle
        }).eq('id', cls.id);
        if (error) throw error;
    },

    async deleteClass(id: string) {
        const { error } = await supabase.from('class_types').delete().eq('id', id);
        if (error) throw error;
    },

    // --- SESSIONS ---
    async getSessions(): Promise<LessonSession[]> {
        const { data, error } = await supabase
            .from('sessions')
            .select(`
        *,
        enrollments (user_id)
      `);

        if (error) throw error;

        return data.map(s => ({
            id: s.id,
            classTypeId: s.class_type_id,
            instructorId: s.instructor_id,
            startTime: s.start_time,
            endTime: s.end_time,
            capacity: s.capacity,
            enrolledUserIds: s.enrollments.map((e: any) => e.user_id)
        }));
    },

    async getSessionsForUser(userId: string): Promise<LessonSession[]> {
        // Get sessions where user is enrolled
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
        session:sessions (
          *,
          enrollments (user_id)
        )
      `)
            .eq('user_id', userId);

        if (error) throw error;

        return data.map((item: any) => {
            const s = item.session;
            return {
                id: s.id,
                classTypeId: s.class_type_id,
                instructorId: s.instructor_id,
                startTime: s.start_time,
                endTime: s.end_time,
                capacity: s.capacity,
                enrolledUserIds: s.enrollments.map((e: any) => e.user_id)
            };
        });
    },

    async bookSession(sessionId: string, userId: string) {
        const { data: existing } = await supabase
            .from('enrollments')
            .select('id')
            .eq('session_id', sessionId)
            .eq('user_id', userId)
            .single();

        if (existing) throw new Error('Already enrolled');

        const { error } = await supabase
            .from('enrollments')
            .insert({ session_id: sessionId, user_id: userId });

        if (error) throw error;

        // Decrement credits manually for now
        const { data: profile } = await supabase.from('profiles').select('package_credits').eq('id', userId).single();
        if (profile && profile.package_credits > 0) {
            await supabase.from('profiles').update({ package_credits: profile.package_credits - 1 }).eq('id', userId);
        }
    },

    async deleteSession(id: string) {
        const { error } = await supabase.from('sessions').delete().eq('id', id);
        if (error) throw error;
    },

    // --- PACKAGES ---
    async getPackages(): Promise<Package[]> {
        const { data, error } = await supabase.from('packages').select('*').eq('active', true);
        if (error) throw error;
        return data;
    },

    async createPackage(pkg: Package) {
        const { error } = await supabase.from('packages').insert({
            name: pkg.name,
            credits: pkg.credits,
            price: pkg.price
        });
        if (error) throw error;
    },

    async updatePackage(pkg: Package) {
        const { error } = await supabase.from('packages').update({
            name: pkg.name,
            credits: pkg.credits,
            price: pkg.price
        }).eq('id', pkg.id);
        if (error) throw error;
    },

    async deletePackage(id: string) {
        const { error } = await supabase.from('packages').delete().eq('id', id);
        if (error) throw error;
    },

    async purchasePackage(userId: string, packageId: string) {
        // In real app, this would verify payment.
        // Here we just record purchase and add credits.
        const { data: pkg } = await supabase.from('packages').select('*').eq('id', packageId).single();
        if (!pkg) throw new Error('Package not found');

        const { error } = await supabase
            .from('purchases')
            .insert({
                user_id: userId,
                package_id: packageId,
                package_name: pkg.name,
                amount_paid: pkg.price,
                credits_added: pkg.credits
            });

        if (error) throw error;

        // Update user credits
        // Ideally this is a trigger. I added a trigger for new users, but not for purchases yet.
        // Let's do a manual update for now.
        const { data: profile } = await supabase.from('profiles').select('package_credits').eq('id', userId).single();
        const newCredits = (profile?.package_credits || 0) + pkg.credits;

        await supabase.from('profiles').update({ package_credits: newCredits }).eq('id', userId);
    },

    async getPurchases(userId: string): Promise<Purchase[]> {
        const { data, error } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', userId)
            .order('purchase_date', { ascending: false });

        if (error) throw error;

        return data.map(p => ({
            id: p.id,
            userId: p.user_id,
            packageName: p.package_name,
            credits: p.credits_added,
            price: p.amount_paid,
            date: p.purchase_date
        }));
    },

    // --- INSTRUCTOR ---
    async getAvailability(instructorId: string): Promise<Availability[]> {
        const { data, error } = await supabase.from('availability').select('*').eq('instructor_id', instructorId);
        if (error) throw error;
        return data.map(a => ({
            id: a.id,
            instructorId: a.instructor_id,
            dayOfWeek: parseInt(a.day_of_week), // Schema has text, but app expects number? Let's check schema. Schema comment says 'Monday' but app sends number. I should fix schema or app. App sends number. Schema has text. I'll store as text or number. Let's store as number in DB to match app or convert.
            // Wait, schema I wrote says "day_of_week text". App sends number (0-6).
            // I should probably change schema to integer or convert here.
            // Let's convert number to string for DB if needed, or just change schema to integer.
            // I'll assume I can store '0', '1' as text or change schema.
            // Let's just cast to number here assuming DB stores string representation of number.
            dayOfWeek: Number(a.day_of_week),
            startTime: a.start_time,
            endTime: a.end_time
        }));
    },
    async createAvailability(avail: Availability) {
        const { error } = await supabase.from('availability').insert({
            instructor_id: avail.instructorId,
            day_of_week: String(avail.dayOfWeek),
            start_time: avail.startTime,
            end_time: avail.endTime
        });
        if (error) throw error;
    },
    async deleteAvailability(id: string) {
        const { error } = await supabase.from('availability').delete().eq('id', id);
        if (error) throw error;
    },

    async getBlockouts(instructorId: string): Promise<Blockout[]> {
        const { data, error } = await supabase.from('blockouts').select('*').eq('instructor_id', instructorId);
        if (error) throw error;
        return data.map(b => ({
            id: b.id,
            instructorId: b.instructor_id,
            date: b.date,
            startTime: b.start_time,
            endTime: b.end_time,
            reason: b.reason
        }));
    },
    async createBlockout(blockout: Blockout) {
        const { error } = await supabase.from('blockouts').insert({
            instructor_id: blockout.instructorId,
            date: blockout.date,
            start_time: blockout.startTime,
            end_time: blockout.endTime,
            reason: blockout.reason
        });
        if (error) throw error;
    },
    async deleteBlockout(id: string) {
        const { error } = await supabase.from('blockouts').delete().eq('id', id);
        if (error) throw error;
    },

    async getProgress(studentId: string): Promise<any[]> {
        const { data, error } = await supabase.from('student_progress').select('*').eq('student_id', studentId);
        if (error) throw error;
        return data.map(p => ({
            id: p.id,
            studentId: p.student_id,
            skillId: p.skill_id,
            status: p.status,
            lastUpdated: p.updated_at
        }));
    },
    async updateProgress(studentId: string, skillId: string, status: any) {
        const { error } = await supabase.from('student_progress').upsert({
            student_id: studentId,
            skill_id: skillId,
            status: status,
            updated_at: new Date().toISOString()
        }, { onConflict: 'student_id, skill_id' });
        if (error) throw error;
    },

    // --- SETTINGS ---
    async getSettings() {
        const { data, error } = await supabase.from('settings').select('*');
        if (error) throw error;

        // Convert array of key-value pairs to object
        const settings: any = {};
        data.forEach(item => {
            settings[item.key] = item.value;
        });

        return {
            poolCapacity: Number(settings.pool_capacity) || 25,
            cancellationHours: Number(settings.cancellation_hours) || 24,
            maintenanceMode: Boolean(settings.maintenance_mode) || false,
            contactEmail: String(settings.contact_email || 'admin@lovableswim.com').replace(/"/g, '')
        };
    },
    async saveSettings(settings: any) {
        const updates = [
            { key: 'pool_capacity', value: settings.poolCapacity },
            { key: 'cancellation_hours', value: settings.cancellationHours },
            { key: 'maintenance_mode', value: settings.maintenanceMode },
            { key: 'contact_email', value: settings.contactEmail }
        ];

        for (const update of updates) {
            const { error } = await supabase.from('settings').upsert(update, { onConflict: 'key' });
            if (error) throw error;
        }
    }
};
