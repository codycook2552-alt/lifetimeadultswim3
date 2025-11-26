
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { User, ClassType, Package, LessonSession, Availability, Blockout } from '../types';

// Query Keys
export const QUERY_KEYS = {
    classes: ['classes'],
    sessions: ['sessions'],
    packages: ['packages'],
    users: ['users'],
    settings: ['settings'],
    instructor: (id: string) => ['instructor', id],
    user: (id: string) => ['user', id],
};

// --- QUERIES ---

export const useClasses = () => {
    return useQuery({
        queryKey: QUERY_KEYS.classes,
        queryFn: () => api.getClasses(),
    });
};

export const useSessions = () => {
    return useQuery({
        queryKey: QUERY_KEYS.sessions,
        queryFn: () => api.getSessions(),
    });
};

export const usePackages = () => {
    return useQuery({
        queryKey: QUERY_KEYS.packages,
        queryFn: () => api.getPackages(),
    });
};

export const useUsers = () => {
    return useQuery({
        queryKey: QUERY_KEYS.users,
        queryFn: () => api.getUsers(),
    });
};

export const useSettings = () => {
    return useQuery({
        queryKey: QUERY_KEYS.settings,
        queryFn: () => api.getSettings(),
    });
};

export const useInstructorData = (instructorId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.instructor(instructorId),
        queryFn: async () => {
            const [availability, blockouts, sessions] = await Promise.all([
                api.getAvailability(instructorId),
                api.getBlockouts(instructorId),
                api.getSessions() // We filter this client-side or we could add an API method for it
            ]);
            // Filter sessions for this instructor
            const instructorSessions = sessions.filter(s => s.instructorId === instructorId);
            return { availability, blockouts, sessions: instructorSessions };
        },
        enabled: !!instructorId,
    });
};

export const useUserData = (userId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.user(userId),
        queryFn: async () => {
            const [sessions, purchases] = await Promise.all([
                api.getSessions(),
                api.getPurchases(userId)
            ]);

            // Filter sessions where user is enrolled
            const userSessions = sessions.filter(s => s.enrolledUserIds.includes(userId));

            return { sessions: userSessions, purchases };
        },
        enabled: !!userId,
    });
};

// --- MUTATIONS (Optional but recommended for future) ---
// We can add mutations here later for create/update/delete actions
