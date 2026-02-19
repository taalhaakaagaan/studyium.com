const db = require('./db');

async function testGetTeachers(studentId) {
    console.log(`Testing get-my-teachers for studentId: ${studentId}`);
    try {
        const query = `
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
        `;

        const [rows] = await db.execute(query, [studentId]);
        console.log(`Teachers found: ${rows.length}`);
        console.log("Rows:", rows);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

testGetTeachers(67);
