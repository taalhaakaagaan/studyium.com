const db = require('./db');

async function checkData() {
    try {
        // Check bookings schema
        const [bookingCols] = await db.execute("DESCRIBE bookings");
        console.log("Bookings Columns:", bookingCols.map(c => c.Field));

        // Check columns in bookings for student 67
        const [bookings] = await db.execute("SELECT * FROM bookings WHERE student_id = 67 LIMIT 1");
        console.log("Sample Booking:", bookings[0]);

        // Check tutor 28 subjects
        const [tutor] = await db.execute("SELECT subjects FROM tutors WHERE id = 28");
        console.log("Tutor 28 Subjects:", tutor[0]?.subjects);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkData();
