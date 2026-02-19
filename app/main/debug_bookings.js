const db = require('./db');

async function checkBookings(studentId) {
    try {
        const [rows] = await db.execute(`
            SELECT id, student_id, tutor_id, lesson_id, booking_date, status, created_at
            FROM bookings
            WHERE student_id = ?
        `, [studentId]);

        console.log(`Found ${rows.length} bookings for student ${studentId}:`);
        rows.forEach(r => {
            console.log(`ID: ${r.id}, Tutor: ${r.tutor_id}, Lesson: ${r.lesson_id}, Date: ${r.booking_date}, Status: ${r.status}`);
        });

        // Check server time
        const [time] = await db.execute("SELECT NOW() as server_time");
        console.log("Server Time:", time[0].server_time);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkBookings(67);
