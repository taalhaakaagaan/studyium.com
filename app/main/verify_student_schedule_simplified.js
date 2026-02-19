const db = require('./db');

async function verifySimplifiedQuery() {
    try {
        console.log("--- VERIFYING SIMPLIFIED STUDENT SCHEDULE QUERY ---");
        const studentId = 67; // Sümeyye

        const [program] = await db.execute(`
            SELECT 
                ws.*,
                u.name as teacher_name,
                t.user_id as teacher_user_id
            FROM weekly_schedules ws
            JOIN tutors t ON ws.teacher_id = t.user_id
            JOIN user_data u ON t.user_id = u.id
            WHERE ws.student_id = ?
        `, [studentId]);

        console.log(`Results for student ${studentId}: ${program.length}`);
        if (program.length > 0) {
            program.forEach(p => console.log(`- ${p.note} by ${p.teacher_name}`));
        } else {
            // Check if tutors or user_data entries are missing for teacher_id 21
            const [teacherInfo] = await db.execute(`
                SELECT ws.teacher_id, t.id as tutor_id, u.id as user_id
                FROM weekly_schedules ws
                LEFT JOIN tutors t ON ws.teacher_id = t.user_id
                LEFT JOIN user_data u ON t.user_id = u.id
                WHERE ws.student_id = ?
            `, [studentId]);
            console.log("Teacher lookup info:", teacherInfo);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

verifySimplifiedQuery();
