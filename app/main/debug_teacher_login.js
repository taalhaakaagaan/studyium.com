const db = require('./db');
const { app } = require('electron');

async function findTeacherLogin() {
    try {
        console.log("--- FINDING TEACHER WITH STUDENTS ---");

        // Find a tutor who has bookings
        const [bookings] = await db.execute("SELECT DISTINCT tutor_id FROM bookings LIMIT 5");

        for (const b of bookings) {
            const tutorId = b.tutor_id;
            const [tutor] = await db.execute("SELECT user_id, subjects FROM tutors WHERE id = ?", [tutorId]);
            if (tutor.length > 0) {
                const userId = tutor[0].user_id;
                const [user] = await db.execute("SELECT name, email, role FROM user_data WHERE id = ?", [userId]);
                if (user.length > 0) {
                    console.log(`\nTutor ID: ${tutorId}`);
                    console.log(`User ID: ${userId}`);
                    console.log(`Name: ${user[0].name}`);
                    console.log(`Email: ${user[0].email}`);
                    console.log(`Role: ${user[0].role}`);
                    console.log(`Subjects: ${tutor[0].subjects}`);
                }
            }
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

findTeacherLogin();
