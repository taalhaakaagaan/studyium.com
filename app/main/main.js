/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { app, BrowserWindow, protocol, net, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const db = require('./db');
const { sendVerificationEmail } = require('./mailer');

// Configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.transports.file.level = "info";

// Session & Data Path
const DATA_PATH = path.join(app.getPath('userData'), 'session.json');
let currentSession = null;

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
            webSecurity: false,
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/favicon.ico')
    });

    const isDev = !app.isPackaged;
    const startUrl = process.env.ELECTRON_START_URL || (isDev ? 'http://localhost:3000' : `${SCHEME}://index.html`);
    mainWindow.loadURL(startUrl);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

function saveSession(data, persist = true) {
    currentSession = data;
    if (persist) {
        try {
            fs.writeFileSync(DATA_PATH, JSON.stringify(data));
        } catch (e) {
            console.error("Error saving session:", e);
        }
    }
}

function loadSession() {
    if (currentSession) return currentSession;
    try {
        if (fs.existsSync(DATA_PATH)) {
            const data = JSON.parse(fs.readFileSync(DATA_PATH));
            currentSession = data;
            return data;
        }
    } catch (e) {
        console.error("Error loading session:", e);
    }
    return null;
}

function clearSession() {
    currentSession = null;
    try {
        if (fs.existsSync(DATA_PATH)) {
            fs.unlinkSync(DATA_PATH);
        }
    } catch (e) {
        console.error("Error clearing session:", e);
    }
}

// ---------------- IPC HANDLERS (DIRECT DB) ----------------

// 1. LOGIN
ipcMain.handle('db:login', async (event, arg) => {
    try {
        const email = typeof arg === 'string' ? arg : arg.email;
        const remember = typeof arg === 'object' ? arg.remember : true;
        const portal = typeof arg === 'object' ? arg.portal : 'student';

        // Check Admin
        if (email === 'studyium.17@gmail.com') {
            // Query actual admin ID from database
            const [rows] = await db.execute("SELECT id, name, role FROM user_data WHERE email = ?", [email]);
            let adminUser = rows[0];

            if (!adminUser) {
                // If admin user doesn't exist in DB, fallback or create? 
                // Let's assume user exists or fallback to ID 1
                adminUser = { id: 1, name: 'Admin', role: 'admin', email };
            }

            const sessData = {
                email: adminUser.email,
                role: 'admin',
                id: adminUser.id,
                name: adminUser.name,
                loggedInAt: Date.now()
            };
            saveSession(sessData, remember);
            return { success: true, ...adminUser, role: 'admin', requires2FA: false };
        }

        // Regular User Check
        const [users] = await db.execute("SELECT id, name, surname, email, role FROM user_data WHERE email = ?", [email]);
        if (users.length === 0) {
            return { success: false, message: 'Bu email ile kayıtlı kullanıcı bulunamadı.' };
        }
        const user = users[0];
        const role = user.role;

        // Role vs Portal Validation
        if (portal === 'student' && role !== 'student' && role !== 'user') {
            return { success: false, message: 'Bu email bir öğrenci hesabına ait değil.' };
        }
        if (portal === 'teacher' && role !== 'tutor' && role !== 'teacher' && role !== 'admin') {
            return { success: false, message: 'Bu email bir öğretmen hesabına ait değil.' };
        }

        // Send 2FA Code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await db.execute("UPDATE user_data SET verification_token = ? WHERE id = ?", [code, user.id]);

        const name = user.name || email;
        const sent = await sendVerificationEmail(email, name, code, 'login');

        if (sent) {
            return { success: true, requires2FA: true, email: email, role: role };
        } else {
            return { success: false, message: 'Email gönderilemedi. Lütfen tekrar deneyin.' };
        }
    } catch (e) {
        console.error("Login Error:", e);
        return { success: false, message: "Veritabanı hatası: " + e.message };
    }
});

// 2. VERIFY 2FA
ipcMain.handle('db:verify-2fa', async (event, email, code) => {
    try {
        const [users] = await db.execute("SELECT id, name, email, role, verification_token FROM user_data WHERE email = ?", [email]);
        if (users.length === 0) return { success: false, message: 'Kullanıcı bulunamadı.' };

        const user = users[0];
        if (user.verification_token !== code) {
            // Optional: allow a "master code" for debugging if needed, but sticking to logic.
            // Actually, verify_login_code.php logic was simple string compare.
            return { success: false, message: 'Hatalı kod.' };
        }

        // Clear token
        await db.execute("UPDATE user_data SET verification_token = NULL WHERE id = ?", [user.id]);

        saveSession({
            email,
            role: user.role,
            id: user.id,
            name: user.name,
            loggedInAt: Date.now()
        }, true);
        return { success: true, role: user.role, email };
    } catch (e) {
        return { success: false, message: e.message };
    }
});

// 3. SESSION / LOGOUT
ipcMain.handle('db:check-session', async () => {
    const s = loadSession();
    if (s) return { success: true, ...s };
    return { success: false };
});

ipcMain.handle('db:logout', async () => {
    clearSession();
    return { success: true };
});

// 4. USERS & STATS
ipcMain.handle('db:get-users', async (event, args) => {
    try {
        const role = args?.role || '';
        const search = args?.search || '';

        let query = "SELECT id, name, email, role, created_at FROM user_data WHERE 1=1";
        const params = [];

        if (role) {
            query += " AND role = ?";
            params.push(role);
        }
        if (search) {
            query += " AND (name LIKE ? OR email LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }
        query += " ORDER BY created_at DESC";

        const [users] = await db.execute(query, params);
        return { success: true, users };
    } catch (e) {
        return { success: false, message: e.message };
    }
});

ipcMain.handle('db:get-admin-stats', async () => {
    try {
        // Users
        const [uRes] = await db.execute("SELECT COUNT(*) as c FROM user_data WHERE role='user' OR role='student'");
        const totalStudents = uRes[0].c;

        const [tRes] = await db.execute("SELECT COUNT(*) as c FROM tutors");
        const totalTeachers = tRes[0].c;

        // Lessons
        const [lRes] = await db.execute("SELECT COUNT(*) as c FROM lessons");
        const totalLessons = lRes[0].c;

        // Bookings
        const [bRes] = await db.execute("SELECT COUNT(*) as c FROM bookings WHERE status = 'pending'");
        const pendingBookings = bRes[0].c;

        // Visitors (Check table exists)
        let dailyVisitors = 0, monthlyVisitors = 0;
        try {
            // Just try query, if fails, assume 0
            const today = new Date().toISOString().slice(0, 10);
            const [dRes] = await db.execute("SELECT COUNT(*) as c FROM site_visits WHERE visit_date = ?", [today]);
            dailyVisitors = dRes[0].c;

            const month = today.slice(0, 7); // YYYY-MM
            const [mRes] = await db.execute("SELECT COUNT(DISTINCT ip_address) as c FROM site_visits WHERE visit_date LIKE ?", [`${month}%`]);
            monthlyVisitors = mRes[0].c;
        } catch (e) { /* ignore missing table */ }

        // Matchings
        const matchingsSql = `SELECT 
            t.id as tutor_id, t.user_id as tutor_user_id,
            t_ud.name as teacher_name, t_ud.email as teacher_email,
            s.id as student_id, s.name as student_name, s.email as student_email,
            COUNT(b.id) as total_lessons,
            SUM(CASE WHEN b.payment IS NOT NULL THEN b.payment ELSE 0 END) as total_paid,
            MIN(b.booking_date) as first_lesson,
            MAX(b.booking_date) as last_lesson
        FROM bookings b
        JOIN tutors t ON b.tutor_id = t.id
        JOIN user_data t_ud ON t.user_id = t_ud.id
        JOIN user_data s ON b.student_id = s.id
        GROUP BY t.id, t.user_id, t_ud.name, t_ud.email, s.id, s.name, s.email
        ORDER BY last_lesson DESC`;

        const [matchings] = await db.execute(matchingsSql);

        const stats = {
            totalStudents,
            totalTeachers,
            totalSessions: pendingBookings,
            activeSessions: pendingBookings, // using same metric for now
            totalRevision: 0,
            totalVisitors: dailyVisitors,
            totalLessons,
            monthlyVisitors,
            matchings
        };

        return { success: true, stats };
    } catch (e) {
        console.error("Stats Error", e);
        return { success: false, message: e.message };
    }
});

// 5. USER DETAILS
ipcMain.handle('db:get-user-details', async (event, userId) => {
    try {
        const [users] = await db.execute("SELECT id, name, email, role, created_at FROM user_data WHERE id = ?", [userId]);
        const user = users[0];
        if (!user) return { success: false, message: "User not found" };

        let bookings = [], comments = [], matchings = [];

        // Fetch bookings
        // If student
        if (user.role === 'student' || user.role === 'user') {
            const [b] = await db.execute(`
                SELECT b.*, t.user_id as teacher_user_id, u.name as teacher_name 
                FROM bookings b 
                LEFT JOIN tutors t ON b.tutor_id = t.id
                LEFT JOIN user_data u ON t.user_id = u.id
                WHERE b.student_id = ? ORDER BY b.booking_date DESC`, [userId]);
            bookings = b;

            // Matchings (My Teachers)
            const [m] = await db.execute(`
                SELECT 
                    t.id as tutor_id, t.user_id as teacher_user_id,
                    u.name as teacher_name, u.email as teacher_email,
                    COUNT(b.id) as total_lessons,
                    SUM(CASE WHEN b.payment IS NOT NULL THEN b.payment ELSE 0 END) as total_paid,
                    MAX(b.booking_date) as last_lesson
                FROM bookings b
                JOIN tutors t ON b.tutor_id = t.id
                JOIN user_data u ON t.user_id = u.id
                WHERE b.student_id = ?
                GROUP BY t.id, t.user_id, u.name, u.email`, [userId]);
            matchings = m;

        } else if (user.role === 'tutor' || user.role === 'teacher') {
            // If teacher
            // Need tutor_id first
            const [tRes] = await db.execute("SELECT id FROM tutors WHERE user_id = ?", [userId]);
            if (tRes.length > 0) {
                const tutorId = tRes[0].id;
                const [b] = await db.execute(`
                    SELECT b.*, s.name as student_name 
                    FROM bookings b 
                    LEFT JOIN user_data s ON b.student_id = s.id
                    WHERE b.tutor_id = ? ORDER BY b.booking_date DESC`, [tutorId]);
                bookings = b;

                const [c] = await db.execute("SELECT * FROM comments WHERE tutor_id = ?", [tutorId]);
                comments = c;

                const [m] = await db.execute(`
                    SELECT 
                        s.id as student_id, s.name as student_name, s.email as student_email,
                        COUNT(b.id) as total_lessons,
                        SUM(CASE WHEN b.payment IS NOT NULL THEN b.payment ELSE 0 END) as total_paid,
                        MAX(b.booking_date) as last_lesson
                    FROM bookings b
                    JOIN user_data s ON b.student_id = s.id
                    WHERE b.tutor_id = ?
                    GROUP BY s.id, s.name, s.email`, [tutorId]);
                matchings = m;
            }
        }

        return { success: true, user, bookings, comments, stats: [], matchings };
    } catch (e) {
        return { success: false, message: e.message };
    }
});

ipcMain.handle('db:get-my-teachers', async (event, userId) => {
    try {
        // Updated query to ensure we get teachers with APPROVED bookings
        const [m] = await db.execute(`
            SELECT 
                t.id as tutor_id, t.user_id as teacher_user_id,
                u.name as teacher_name, u.email as teacher_email,
                t.hourly_rate, t.rating,
                t.subjects,
                COUNT(b.id) as total_lessons,
                MAX(b.booking_date) as last_lesson
            FROM bookings b
            JOIN tutors t ON b.tutor_id = t.id
            JOIN user_data u ON t.user_id = u.id
            WHERE b.student_id = ? AND b.status = 'approved'
            GROUP BY t.id, t.user_id, u.name, u.email, t.hourly_rate, t.rating, t.subjects
        `, [userId]);
        return { success: true, teachers: m };
    } catch (e) {
        return { success: false, message: e.message };
    }
});


// 6. CHAT
ipcMain.handle('db:sync-groups', async () => {
    try {
        const standardGroups = ["TYT Matematik", "TYT Türkçe", "TYT Fizik", "TYT Kimya", "TYT Biyoloji", "TYT Tarih", "TYT Coğrafya", "AYT Matematik", "AYT Fizik", "AYT Kimya", "AYT Biyoloji", "AYT Edebiyat", "AYT Tarih", "AYT Coğrafya"];
        for (const g of standardGroups) {
            const [rows] = await db.execute("SELECT id FROM chat_groups WHERE name = ?", [g]);
            if (rows.length === 0) {
                await db.execute("INSERT INTO chat_groups (name, type) VALUES (?, 'lesson')", [g]);
            }
        }
        return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
});

ipcMain.handle('db:get-groups', async () => {
    try {
        const [groups] = await db.execute(`
            SELECT g.*, MAX(m.created_at) as last_msg_time 
            FROM chat_groups g
            LEFT JOIN chat_group_messages m ON m.group_id = g.id
            GROUP BY g.id
            ORDER BY (MAX(m.created_at) IS NULL), MAX(m.created_at) DESC, g.name ASC`);
        return { success: true, groups };
    } catch (e) { return { success: false, message: e.message }; }
});

ipcMain.handle('db:get-group-messages', async (event, groupId) => {
    try {
        const [messages] = await db.execute(`
            SELECT m.id, m.content, m.message_type, m.created_at,
            u.name as sender_name, u.email as sender_email, u.role as sender_role, m.sender_id
            FROM chat_group_messages m
            JOIN user_data u ON m.sender_id = u.id
            WHERE m.group_id = ?
            ORDER BY m.created_at ASC`, [groupId]);
        return { success: true, messages };
    } catch (e) { return { success: false, message: e.message }; }
});

ipcMain.handle('db:send-group-message', async (event, data) => {
    try {
        const { groupId, senderId, content, type } = data;
        await db.execute("INSERT INTO chat_group_messages (group_id, sender_id, content, message_type) VALUES (?, ?, ?, ?)",
            [groupId, senderId, content, type]);
        return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
});

ipcMain.handle('db:get-dm-contacts', async (event, args) => {
    try {
        const search = args?.search || '';
        const session = loadSession();
        const userId = session?.id || 0; // Fallback to 0
        console.log("get-dm-contacts:", { userId, search });

        let query = `
            SELECT 
                u.id, u.name, u.email, u.role,
                MAX(m.created_at) as last_msg_time,
                 (SELECT COUNT(*) FROM chat_direct_messages 
                 WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count
            FROM user_data u
            LEFT JOIN chat_direct_messages m 
                ON (m.sender_id = u.id AND m.receiver_id = ?) 
                OR (m.receiver_id = u.id AND m.sender_id = ?)
            WHERE u.id != ?`;

        const params = [userId, userId, userId, userId];

        if (search) {
            query += " AND (u.name LIKE ? OR u.email LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        query += " GROUP BY u.id ORDER BY (MAX(m.created_at) IS NULL), MAX(m.created_at) DESC, u.name ASC LIMIT 50";

        const [contacts] = await db.execute(query, params);
        console.log("get-dm-contacts result count:", contacts.length);
        return { success: true, contacts };
    } catch (e) {
        console.error("get-dm-contacts error:", e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('db:get-dm-messages', async (event, args) => {
    try {
        const contactId = args?.contactId;
        const session = loadSession();
        const userId = session?.id || args?.userId || 0;
        console.log("get-dm-messages:", { userId, contactId });

        const [messages] = await db.execute(`
            SELECT m.id, m.content, m.message_type, m.created_at, m.sender_id, u.name as sender_name
            FROM chat_direct_messages m
            LEFT JOIN user_data u ON m.sender_id = u.id
            ORDER BY m.created_at ASC`, [userId, contactId, contactId, userId]);
        return { success: true, messages };
    } catch (e) {
        console.error("get-dm-messages error:", e);
        return { success: false, message: e.message };
    }
});

// 7.1 UNREAD COUNTS
ipcMain.handle('db:get-unread-counts', async (event, userId) => {
    try {
        // DM unread count
        const [dmRes] = await db.execute(`
            SELECT COUNT(*) as c FROM chat_direct_messages 
            WHERE receiver_id = ? AND is_read = 0`, [userId]);
        const dmCount = dmRes[0].c;

        // Group unread count (for future use, or if groups tracked read status)
        // For now, assuming 0 or implementing basic check if needed.
        // If chat_group_messages doesn't track read status per user, we might return 0 or check a separate table.
        // Let's assume 0 for groups for now to stop the crash.
        const groupCount = 0;

        return { success: true, dm: dmCount, groups: groupCount };
    } catch (e) {
        return { success: false, message: e.message };
    }
});

ipcMain.handle('db:send-dm-message', async (event, data) => {
    try {
        const { senderId, receiverId, content, type } = data;
        await db.execute("INSERT INTO chat_direct_messages (sender_id, receiver_id, content, message_type) VALUES (?, ?, ?, ?)",
            [senderId, receiverId, content, type]);
        return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
});

// 7. UPDATED SCHEDULE & LIVE
ipcMain.handle('db:get-schedule', async (event, args) => {
    try {
        const studentId = args?.studentId;

        // 1. Fetch Weekly Program (7-day calendar)
        const [program] = await db.execute(`
            SELECT 
                ws.*,
                u.name as teacher_name,
                l.name as lesson_name,
                t.user_id as teacher_user_id,
                t.meeting_link
            FROM weekly_schedules ws
            JOIN tutors t ON ws.teacher_id = t.user_id
            JOIN user_data u ON t.user_id = u.id
            LEFT JOIN bookings b ON (b.tutor_id = t.id AND b.student_id = ? AND DATE_FORMAT(b.booking_date, '%W') = ws.day_of_week AND b.status = 'approved')
            LEFT JOIN lessons l ON b.lesson_id = l.id
            WHERE (ws.student_id = ? OR (ws.student_id IS NULL AND ws.teacher_id IN (SELECT DISTINCT user_id FROM tutors WHERE id IN (SELECT tutor_id FROM bookings WHERE student_id = ?))))
            ORDER BY FIELD(ws.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), ws.start_time
        `, [studentId, studentId, studentId]);

        // 2. Fetch Active/Upcoming Lessons List (Including Unscheduled)
        const [activeLessons] = await db.execute(`
            SELECT 
                b.id,
                b.booking_date,
                l.name as lesson_name,
                u.name as teacher_name,
                DATE_FORMAT(b.booking_date, '%H:%i') as time,
                DATE_FORMAT(b.booking_date, '%d.%m.%Y') as date,
                DATE_FORMAT(b.created_at, '%d.%m.%Y') as purchase_date,
                b.topic as booking_topic,
                b.payment,
                tp.name as topic_name,
                tp.price as topic_price
            FROM bookings b
            LEFT JOIN tutors t ON b.tutor_id = t.id
            LEFT JOIN user_data u ON t.user_id = u.id
            LEFT JOIN lessons l ON b.lesson_id = l.id
            LEFT JOIN topics tp ON b.lesson_id = tp.id
            WHERE b.student_id = ? 
            AND b.status = 'approved'
            AND (b.booking_date IS NULL OR b.booking_date >= NOW())
            ORDER BY 
                CASE WHEN b.booking_date IS NULL THEN 0 ELSE 1 END, -- Show unscheduled first
                b.booking_date ASC
            LIMIT 10
        `, [studentId]);

        // Enhance activeLessons with topic name if available
        const enhancedLessons = activeLessons.map(l => ({
            ...l,
            display_name: l.topic_name || l.lesson_name || l.booking_topic || l.subjects || 'Ders'
        }));

        return {
            success: true,
            weekly_program: program,
            active_lessons: enhancedLessons
        };
    } catch (e) {
        console.error("Error in db:get-schedule:", e);
        return { success: false, message: e.message };
    }
});

// Get Teacher's Weekly Schedule (Student Specific)
ipcMain.handle('db:get-teacher-schedule', async (event, args) => {
    try {
        const { teacherId, studentId } = args;
        let query = "SELECT * FROM weekly_schedules WHERE teacher_id = ?";
        const params = [teacherId];

        if (studentId) {
            query += " AND student_id = ?";
            params.push(studentId);
        } else {
            // General schedule (if we still use it, or for templating)
            query += " AND student_id IS NULL";
        }

        const [rows] = await db.execute(query, params);
        return { success: true, schedule: rows };
    } catch (e) {
        console.error("Error in db:get-teacher-schedule:", e);
        return { success: false, message: e.message };
    }
});

// Save Teacher's Weekly Schedule (Student Specific)
ipcMain.handle('db:save-weekly-schedule', async (event, args) => {
    try {
        const { teacherId, scheduleData, studentId } = args;

        await db.execute("START TRANSACTION");

        // 1. Delete existing schedule for this teacher AND this student
        let deleteQuery = "DELETE FROM weekly_schedules WHERE teacher_id = ?";
        const deleteParams = [teacherId];

        if (studentId) {
            deleteQuery += " AND student_id = ?";
            deleteParams.push(studentId);
        } else {
            deleteQuery += " AND student_id IS NULL";
        }

        await db.execute(deleteQuery, deleteParams);

        // 2. Insert new rows
        if (scheduleData && scheduleData.length > 0) {
            const values = [];
            const placeholders = [];

            for (const item of scheduleData) {
                placeholders.push("(?, ?, ?, ?, ?, ?, ?)");
                // Assuming item.day is e.g. 'Monday'
                values.push(teacherId, studentId || null, item.day_of_week, item.start_time, item.end_time, item.is_live ? 1 : 0, item.note || '');
            }

            const sql = `INSERT INTO weekly_schedules (teacher_id, student_id, day_of_week, start_time, end_time, is_live, note) VALUES ${placeholders.join(', ')}`;
            await db.execute(sql, values);
        }

        await db.execute("COMMIT");
        return { success: true };

    } catch (e) {
        await db.execute("ROLLBACK");
        console.error("Error in db:save-weekly-schedule:", e);
        return { success: false, message: e.message };
    }
});

// Tutor Dashboard Stats
ipcMain.handle('db:get-tutor-dashboard', async (event, teacherUserId) => {
    try {
        // 1. Get Tutor ID from User ID
        const [tutor] = await db.execute("SELECT id FROM tutors WHERE user_id = ?", [teacherUserId]);
        if (!tutor.length) {
            return { success: false, message: "Tutor not found" };
        }
        const tutorId = tutor[0].id;

        // 2. Get Unique Students with their upcoming live lessons
        const [students] = await db.execute(`
            SELECT DISTINCT u.id, u.name, u.email, u.gsm
            FROM bookings b 
            JOIN user_data u ON b.student_id = u.id 
            WHERE b.tutor_id = ?
        `, [tutorId]);

        // 3. Get Teacher's Live Lessons for Button Logic
        const [liveLessons] = await db.execute(`
            SELECT ws.*, u.name as student_name
            FROM weekly_schedules ws
            LEFT JOIN user_data u ON ws.student_id = u.id
            WHERE ws.teacher_id = ? AND ws.is_live = 1
        `, [teacherUserId]);

        return { success: true, my_students: students, live_lessons: liveLessons };
    } catch (e) {
        console.error("Error in db:get-tutor-dashboard:", e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('db:get-active-broadcasts', async () => {
    try {
        try {
            const [broadcasts] = await db.execute("SELECT * FROM broadcasts WHERE is_active = 1");
            return { success: true, broadcasts };
        } catch (e) {
            return { success: true, broadcasts: [] }; // Return empty if table doesn't exist yet
        }
    } catch (e) { return { success: false, message: e.message }; }
});

// TUTOR SETTINGS
ipcMain.handle('db:get-tutor-settings', async (event, userId) => {
    try {
        const [rows] = await db.execute("SELECT meeting_link FROM tutors WHERE user_id = ?", [userId]);
        return { success: true, settings: rows[0] || { meeting_link: null } };
    } catch (e) {
        return { success: false, message: e.message };
    }
});

ipcMain.handle('db:update-meeting-link', async (event, { userId, link }) => {
    try {
        await db.execute("UPDATE tutors SET meeting_link = ? WHERE user_id = ?", [link, userId]);
        return { success: true };
    } catch (e) {
        return { success: false, message: e.message };
    }
});

// App Lifecycle
app.on('ready', () => {
    protocol.registerFileProtocol(SCHEME, (request, callback) => {
        let normPath;
        try {
            const parsedUrl = new URL(request.url);
            let pathname = parsedUrl.pathname;
            try { pathname = decodeURI(pathname); } catch (e) { }
            if (pathname.startsWith('/') || pathname.startsWith('\\')) pathname = pathname.substring(1);
            normPath = path.normalize(path.join(__dirname, '../out', pathname));
        } catch (e) {
            normPath = path.join(__dirname, '../out/index.html');
        }
        if (normPath.indexOf(path.join(__dirname, '../out')) !== 0) normPath = path.join(__dirname, '../out/index.html');

        let exists = fs.existsSync(normPath);
        let isDir = exists && fs.statSync(normPath).isDirectory();

        if (isDir) {
            const indexPath = path.join(normPath, 'index.html');
            if (fs.existsSync(indexPath)) {
                normPath = indexPath;
                exists = true;
                isDir = false;
            }
        }
        if (!exists || isDir) normPath = path.join(__dirname, '../out/index.html');
        callback({ path: normPath });
    });

    loadSession();
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
    setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 1000 * 60 * 30);
});

autoUpdater.on('update-available', () => { if (mainWindow) mainWindow.webContents.send('update_available'); });
autoUpdater.on('update-downloaded', (info) => { if (mainWindow) mainWindow.webContents.send('update_downloaded', info); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });
