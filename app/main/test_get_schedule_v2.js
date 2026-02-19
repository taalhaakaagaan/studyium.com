const db = require('./db');

async function testScheduleQuery(studentId) {
    console.log(`Testing schedule query for studentId: ${studentId}`);
    try {
        // Query exactly as in main.js
        const [activeLessons] = await db.execute(`
            SELECT 
                b.id,
                b.booking_date,
                l.name as lesson_name,
                u.name as teacher_name,
                t.subjects,
                DATE_FORMAT(b.booking_date, '%H:%i') as time,
                DATE_FORMAT(b.booking_date, '%d.%m.%Y') as date,
                DATE_FORMAT(b.created_at, '%d.%m.%Y') as purchase_date,
                b.topic as booking_topic,
                b.payment,
                tp.name as topic_name
            FROM bookings b
            LEFT JOIN tutors t ON b.tutor_id = t.id
            LEFT JOIN user_data u ON t.user_id = u.id
            LEFT JOIN lessons l ON b.lesson_id = l.id
            LEFT JOIN topics tp ON b.lesson_id = tp.id
            WHERE b.student_id = ? 
            AND b.status = 'approved'
            AND (b.booking_date IS NULL OR b.booking_date >= NOW())
            ORDER BY 
                CASE WHEN b.booking_date IS NULL THEN 0 ELSE 1 END,
                b.booking_date ASC
            LIMIT 10
        `, [studentId]);

        console.log("Active Lessons Found:", activeLessons.length);
        console.log("Data:", JSON.stringify(activeLessons, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

testScheduleQuery(67);
