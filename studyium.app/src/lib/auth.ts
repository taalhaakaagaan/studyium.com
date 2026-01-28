import { create } from 'zustand';
import { MOCK_GROUPS, MOCK_USERS } from './data';

export interface User {
    email: string;
    role: 'admin' | 'teacher' | 'student';
    name?: string;
    id?: string | number;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    login: (user) => set({ user, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
}));

// IPC Wrappers (Client-side)
export const authAPI = {
    login: async (email: string, remember: boolean = true) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            // Support object or args depending on how we changed main.js
            // I changed it to object in main.js: { email, remember }
            return ipcRenderer.invoke('db:login', { email, remember });
        }
        // Fallback for web dev (mock)
        console.warn("IPC not available. Mocking login.");
        if (email.includes("admin")) return { success: true, requires2FA: true, email };
        return { success: true, requires2FA: true, email };
    },
    verify2FA: async (email: string, code: string) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:verify-2fa', email, code);
        }
        return { success: true, role: email.includes("admin") ? 'admin' : 'student', email };
    },
    startBroadcast: async (topic: string, link: string, teacherId: string | number, teacherName: string) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:start-broadcast', { topic, link, teacherId, teacherName });
        }
        return { success: true };
    },
    getActiveBroadcasts: async () => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-active-broadcasts');
        }
        return { success: true, broadcasts: [] };
    },
    sendDMMessage: async (senderId: number, receiverId: number, content: string, type: 'text' | 'image' | 'pdf' = 'text') => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:send-dm-message', { senderId, receiverId, content, type });
        }
        return { success: true };
    },
    quitApp: async () => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('app:quit');
        }
        console.log("App quit (mock)");
    },
    getUsers: async (role?: string, search?: string) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-users', { role, search });
        }
        return { success: true, users: [] };
    },
    getVisitors: async (search?: string) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-visitors', { search });
        }
        return { success: true, visitors: [] };
    },
    getUserDetails: async (id: string | number) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-user-details', id);
        }
        return {
            success: true,
            user: { id, name: 'Mock User', email: 'mock@test.com', role: 'student' },
            bookings: [],
            comments: [],
            stats: {}
        };
    },
    createUser: async (user: any) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:create-user', user);
        }
        return { success: true };
    },
    deleteUser: async (id: string) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:delete-user', id);
        }
        return { success: true };
    },
    getAdminStats: async () => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-admin-stats');
        }
        // ... (mock implementation omitted for brevity)
        return { success: true, stats: {} };
    },
    checkSession: async () => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:check-session');
        }
        return { success: false };
    },
    logout: async () => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:logout');
        }
        return { success: true };
    },
    createBooking: async (bookingData: any) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:create-booking', bookingData);
        }
        return { success: true };
    }
};

export const chatAPI = {
    syncGroups: async () => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:sync-groups');
        }
        return { success: true };
    },
    getGroups: async () => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-groups');
        }
        return { success: true, groups: MOCK_GROUPS };
    },
    getGroupMessages: async (groupId: string) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-group-messages', groupId);
        }
        return { success: true, messages: [] };
    },
    sendGroupMessage: async (groupId: string, senderId: string | number, content: string, type: 'text' | 'image' | 'pdf') => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:send-group-message', { groupId, senderId, content, type });
        }
        return { success: true };
    },
    getDMContacts: async () => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-dm-contacts');
        }
        return { success: true, contacts: MOCK_USERS };
    },
    getContacts: async () => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-dm-contacts');
        }
        return { success: true, contacts: MOCK_USERS };
    },
    getDMMessages: async (userId: string | number, contactId: string | number) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-dm-messages', { userId, contactId });
        }
        return { success: true, messages: [] };
    },
    sendDMMessage: async (senderId: string | number, receiverId: string | number, content: string, type: 'text' | 'image' | 'pdf' = 'text') => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:send-dm-message', { senderId, receiverId, content, type });
        }
        return { success: true };
    },
    getUnreadCounts: async (userId: string | number) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-unread-counts', userId);
        }
        return { success: true, dm: 0, groups: 0 };
    },
    createLiveSession: async (data: { teacherId: any, topic: string, participants: any[], link: string }) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:create-live-session', data);
        }
        return { success: true, id: 123 };
    },
    getActiveSessions: async (userId: any) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-active-sessions', userId);
        }
        return { success: true, sessions: [] };
    }
};
