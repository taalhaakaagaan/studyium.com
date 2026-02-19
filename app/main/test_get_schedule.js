const db = require('./db');

async function testSchedule(studentId) {
    console.log(`Testing schedule for studentId: ${studentId}`);
    try {
        const [rows] = await db.execute(`
            SELECT b.*, 
                l.name as lesson_name,
                DATE_FORMAT(b.booking_date, '%W') as day_of_week,
                DATE_FORMAT(b.booking_date, '%H') as start_time_hour,
                DATE_FORMAT(b.booking_date, '%i') as start_time_minute,
                t.user_id as tutor_user_id
            FROM bookings b
            LEFT JOIN lessons l ON b.lesson_id = l.id
            LEFT JOIN tutors t ON b.tutor_id = t.id
            WHERE b.student_id = ?
        `, [studentId]);

        console.log(`Rows found: ${rows.length}`);
        if (rows.length > 0) {
            console.log("Sample row:", rows[0]);
            console.log("Status of first row:", rows[0].status);
            console.log("Booking date:", rows[0].booking_date);
        }

        const schedule = rows.filter(r => r.status === 'approved').map(r => ({
            ...r,
            start_time: `${r.start_time_hour}:${r.start_time_minute}`,
            end_time: `${parseInt(r.start_time_hour) + 1}:${r.start_time_minute}`,
            tutor_id: r.tutor_user_id,
            note: r.lesson_name || 'Lesson'
        }));

        console.log(`Schedule length: ${schedule.length}`);
        console.log("Schedule:", schedule);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

testSchedule(67); // Using ID from previous check
