import { User } from './auth';

export const scheduleAPI = {
    getSchedule: async (studentId: string | number) => {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-schedule', { studentId });
        }
        return { success: true, schedule: [] };
    },
    getActiveBroadcasts: async () => {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-active-broadcasts');
        }
        return { success: true, broadcasts: [] };
    },
    getTeacherSchedule: async (teacherId: string | number, studentId?: string | number) => {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:get-teacher-schedule', { teacherId, studentId });
        }
        return { success: true, schedule: [] };
    },
    saveWeeklySchedule: async (teacherId: string | number, scheduleData: any[], studentId?: string | number) => {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            return ipcRenderer.invoke('db:save-weekly-schedule', { teacherId, scheduleData, studentId });
        }
        return { success: false, message: "Electron not found" };
    }
};
