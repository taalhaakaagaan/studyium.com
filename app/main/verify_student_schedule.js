const db = require('./db');

async function verifyFixedQuery() {
    try {
        console.log("--- VERIFYING FIXED STUDENT SCHEDULE QUERY (FULL) ---");
        const studentId = 67; // Sümeyye

        // The exact query from main.js after fix
        const [program] = await db.execute(`
            SELECT 
                ws.*,
                u.name as teacher_name,
                l.name as lesson_name,
                t.user_id as teacher_user_id
            FROM weekly_schedules ws
            JOIN tutors t ON ws.teacher_id = t.user_id
            JOIN user_data u ON t.user_id = u.id
            LEFT JOIN bookings b ON (b.tutor_id = t.id AND b.student_id = ? AND DATE_FORMAT(b.booking_date, '%W') = ws.day_of_week AND b.status = 'approved')
            LEFT JOIN lessons l ON b.lesson_id = l.id
            WHERE (ws.student_id = ? OR (ws.student_id IS NULL AND ws.teacher_id IN (SELECT DISTINCT user_id FROM tutors WHERE id IN (SELECT tutor_id FROM bookings WHERE student_id = ?))))
            ORDER BY FIELD(ws.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), ws.start_time
        `, [studentId, studentId, studentId]);

        console.log(`Results for student ${studentId}: ${program.length}`);
        if (program.length > 0) {
            console.log("Found schedule items:");
            program.forEach(p => {
                console.log(`- [${p.day_of_week} ${p.start_time.slice(0, 5)}] ${p.note} (Teacher: ${p.teacher_name}, Lesson: ${p.lesson_name || 'None'})`);
            });
        } else {
            console.log("No schedule items found.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

verifyFixedQuery();
