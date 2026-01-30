/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { app, BrowserWindow, protocol, net, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

// Configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.transports.file.level = "info";

// Session & Data Path
const DATA_PATH = path.join(app.getPath('userData'), 'session.json');
let currentSession = null;
let cookieJar = ''; // Store PHPSESSID

const API_BASE = "https://studyium.com/api";
// NOTE: Change above URL if deploying to a different domain!

function saveSession(data, persist = true) {
    currentSession = data;
    if (persist) {
        try {
            // Also save cookie if possible, but cookies expire.
            // We'll just save the user data. Re-login might be needed if cookie expires.
            const saveData = { ...data, cookie: cookieJar };
            fs.writeFileSync(DATA_PATH, JSON.stringify(saveData));
        } catch (e) {
            console.error("Error saving session:", e);
        }
    } else {
        clearSession();
    }
}

function loadSession() {
    if (currentSession) return currentSession;
    try {
        if (fs.existsSync(DATA_PATH)) {
            const data = JSON.parse(fs.readFileSync(DATA_PATH));
            currentSession = data;
            if (data.cookie) cookieJar = data.cookie;
            return data;
        }
    } catch (e) {
        console.error("Error loading session:", e);
    }
    return null;
}

function clearSession() {
    currentSession = null;
    cookieJar = '';
    try {
        if (fs.existsSync(DATA_PATH)) {
            fs.unlinkSync(DATA_PATH);
        }
    } catch (e) {
        console.error("Error clearing session:", e);
    }
}

// API Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': cookieJar
        };

        const options = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, options);

        // Capture Set-Cookie
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            // Simple logic: append or replace. 
            // Usually PHP sends PHPSESSID=...; path=/
            // We just stash it.
            const parts = setCookie.split(';');
            cookieJar = parts[0]; // Take the first part (name=value)
        }

        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("API Result not JSON:", text.substring(0, 100));
            return { success: false, message: "Invalid API response" };
        }

    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        return { success: false, message: "Network error" };
    }
}


// Custom Scheme
const SCHEME = 'studyium';
protocol.registerSchemesAsPrivileged([
    { scheme: SCHEME, privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true } }
]);

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false, // Allow local file fetching if needed, but risky. 
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/favicon.ico')
    });

    const startUrl = process.env.ELECTRON_START_URL || `${SCHEME}://index.html`;
    mainWindow.loadURL(startUrl);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}
// ---------------- IPC HANDLERS ----------------

// 1. LOGIN
ipcMain.handle('db:login', async (event, arg) => {
    const email = typeof arg === 'string' ? arg : arg.email;
    const remember = typeof arg === 'object' ? arg.remember : true;
    const password = typeof arg === 'object' ? arg.password : '123';
    let finalPass = password || '123';

    // Call API
    const res = await apiCall('/login.php', 'POST', { email, password: finalPass });

    if (res.user || res.message === 'Giriş başarılı') {
        // Success
        const user = res.user;
        const sessData = {
            email: user.email,
            role: user.role,
            id: user.id,
            name: user.name || user.email,
            loggedInAt: Date.now()
        };
        saveSession(sessData, remember);
        return { success: true, ...user, requires2FA: false };
    }

    if (res.require_verification) {
        return { success: true, requires2FA: true, email: email };
    }

    return { success: false, message: res.message || 'Login failed' };
});

// 2. VERIFY 2FA
ipcMain.handle('db:verify-2fa', async (event, email, code) => {
    const res = await apiCall('/verify_login_code.php', 'POST', { email, code });
    if (res.success) {
        const user = res.user;
        saveSession({
            email,
            role: user.role,
            id: user.id,
            name: user.name,
            loggedInAt: Date.now()
        }, true);
        return { success: true, role: user.role, email };
    }
    return { success: false, message: res.message };
});

// 3. BROADCASTS
ipcMain.handle('db:start-broadcast', async (event, { topic, link, teacherId, teacherName }) => {
    return await apiCall('/live/create.php', 'POST', { topic, link, teacherId });
});

ipcMain.handle('db:get-active-broadcasts', async (event) => {
    const res = await apiCall('/live/list.php');
    if (res.success) return { success: true, broadcasts: res.broadcasts };
    return { success: true, broadcasts: [] };
});

// 4. SESSION CHECK
ipcMain.handle('db:check-session', async () => {
    const s = loadSession();
    if (s) return { success: true, ...s };
    return { success: false };
});

ipcMain.handle('db:logout', async () => {
    clearSession();
    return { success: true };
});

// 5. GET USERS/VISITORS/Stats
ipcMain.handle('db:get-users', async (event, args) => {
    const r = await apiCall('/chat/get_dm_contacts.php?search=' + (args?.search || ''));
    return { success: true, users: r.contacts || [] };
});

ipcMain.handle('db:get-visitors', async () => {
    return { success: true, visitors: [] };
});

ipcMain.handle('db:get-admin-stats', async () => {
    const res = await apiCall('/admin/get_stats.php');
    if (res.success) return res;
    // Fallback structure
    return { success: true, stats: { totalStudents: 0, totalTeachers: 0, totalSessions: 0, activeSessions: 0, totalRevenue: 0, totalVisitors: 0, recentUsers: [] } };
});

// 6. BOOKINGS
ipcMain.handle('db:create-booking', async (event, data) => {
    const res = await apiCall('/book.php', 'POST', data);
    if (res.message && (res.message.includes('alındı') || res.message.includes('success'))) {
        return { success: true, id: 0 };
    }
    return { success: !!res.success, message: res.message };
});

// 7. USER DETAILS
ipcMain.handle('db:get-user-details', async (event, userId) => {
    const res = await apiCall(`/get_user_details.php?userId=${userId}`);
    return res;
});

// 8. CHAT
ipcMain.handle('db:sync-groups', async () => {
    return await apiCall('/chat/sync_groups.php');
});

ipcMain.handle('db:get-groups', async () => {
    return await apiCall('/chat/get_groups.php');
});

ipcMain.handle('db:get-group-messages', async (event, groupId) => {
    return await apiCall(`/chat/get_group_messages.php?groupId=${groupId}`);
});

ipcMain.handle('db:send-group-message', async (event, data) => {
    return await apiCall('/chat/send_group_message.php', 'POST', data);
});

ipcMain.handle('db:get-dm-contacts', async (event, { search } = {}) => {
    return await apiCall(`/chat/get_dm_contacts.php?search=${search || ''}`);
});

ipcMain.handle('db:get-dm-messages', async (event, { contactId }) => {
    return await apiCall(`/chat/get_dm_messages.php?contactId=${contactId}`);
});

ipcMain.handle('db:send-dm-message', async (event, data) => {
    return await apiCall('/chat/send_dm_message.php', 'POST', data);
});

ipcMain.handle('db:get-unread-counts', async () => {
    return { success: true, dm: 0, groups: 0 };
});

// 9. SCHEDULE
ipcMain.handle('db:save-schedule-item', async (event, item) => {
    return await apiCall('/schedule/save.php', 'POST', item);
});

ipcMain.handle('db:get-schedule', async (event, { teacherId, studentId }) => {
    let q = '';
    if (teacherId) q += `teacherId=${teacherId}&`;
    if (studentId) q += `studentId=${studentId}&`;
    return await apiCall(`/schedule/get.php?${q}`);
});

ipcMain.handle('db:delete-schedule-item', async (event, id) => {
    return await apiCall('/api/schedule/delete.php', 'POST', { id });
});

// 10. FILE SYSTEM (Keep Local)
ipcMain.handle('app:list-recordings', async () => {
    const dir = app.getPath('downloads');
    try {
        const files = await fs.promises.readdir(dir);
        const recordings = [];
        for (const file of files) {
            // Check for WebM or MP4 files created by our app
            if (file.startsWith('Studyium-Lesson-') && (file.endsWith('.webm') || file.endsWith('.mp4'))) {
                const fullPath = path.join(dir, file);
                const stats = await fs.promises.stat(fullPath);
                recordings.push({
                    name: file,
                    path: fullPath,
                    created: stats.birthtime,
                    size: stats.size
                });
            }
        }
        // Sort by recent
        recordings.sort((a, b) => b.created - a.created);
        return { success: true, recordings };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('app:open-folder', async (event, filePath) => {
    shell.showItemInFolder(filePath);
    return { success: true };
});

ipcMain.handle('app:show-save-dialog', async (event, { defaultPath }) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Save Recording',
        defaultPath,
        filters: [{ name: 'Videos', extensions: ['webm', 'mp4'] }]
    });
    return { filePath };
});

ipcMain.handle('app:save-file', async (event, { filePath, buffer }) => {
    try {
        await fs.promises.writeFile(filePath, Buffer.from(buffer));
        return { success: true };
    } catch (error) {
        console.error('Save file error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('app:quit', () => {
    app.quit();
});

ipcMain.handle('app:install-update', () => {
    autoUpdater.quitAndInstall();
});


// App Lifecycle
app.on('ready', () => {
    // Custom Protocol handler (MUST BE FIRST)
    protocol.registerFileProtocol(SCHEME, (request, callback) => {
        let normPath;
        try {
            const parsedUrl = new URL(request.url);
            let pathname = parsedUrl.pathname;

            // Handle Windows drive letters in pathname if needed, or just standard decoding
            try {
                pathname = decodeURI(pathname);
            } catch (e) {
                // Ignore decoding errors
            }

            // Strip leading slash for path.join to treat it as relative
            if (pathname.startsWith('/') || pathname.startsWith('\\')) {
                pathname = pathname.substring(1);
            }

            normPath = path.normalize(path.join(__dirname, '../out', pathname));

            // Log the path we are trying to serve
            log.info(`[Protocol] Request: ${request.url} -> Parsed: ${pathname} -> Path: ${normPath}`);

        } catch (e) {
            log.error(`[Protocol] Error parsing URL: ${request.url}`, e);
            // Fallback
            normPath = path.join(__dirname, '../out/index.html');
        }

        if (normPath.indexOf(path.join(__dirname, '../out')) !== 0) {
            // Security check
            normPath = path.join(__dirname, '../out/index.html');
        }

        // Handle routes by serving index.html if file not found (SPA)
        // Check if path exists
        let exists = fs.existsSync(normPath);
        let isDir = exists && fs.statSync(normPath).isDirectory();

        // If it's a directory, try to serve index.html inside it (Next.js export behavior)
        if (isDir) {
            const indexPath = path.join(normPath, 'index.html');
            if (fs.existsSync(indexPath)) {
                normPath = indexPath;
                exists = true;
                isDir = false;
            }
        }

        // Handle routes by serving root index.html if file still not found (SPA fallback)
        if (!exists || isDir) {
            log.info(`[Protocol] Not found or dir, serving SPA fallback: ${normPath}`);
            normPath = path.join(__dirname, '../out/index.html');
        }

        callback({ path: normPath });
    });

    // Init session
    loadSession();
    createWindow();

    // DEBUG: Open DevTools
    mainWindow.webContents.openDevTools();

    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();

    // Update interval (every 30 mins)
    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 1000 * 60 * 30);
});

// Auto-updater events
autoUpdater.on('update-available', () => {
    if (mainWindow) mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) {
        mainWindow.webContents.send('update_downloaded', info);
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
