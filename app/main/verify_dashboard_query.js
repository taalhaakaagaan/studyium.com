const db = require('./db');

async function verifyQuery() {
    try {
        console.log("--- VERIFYING DASHBOARD QUERY ---");
        const teacherUserId = 21; // Ege Ceylan

        console.log(`Step 1: Get Tutor ID for User ${teacherUserId}`);
        const [tutor] = await db.execute("SELECT id FROM tutors WHERE user_id = ?", [teacherUserId]);
        if (!tutor.length) {
            console.log("Tutor not found!");
            return;
        }
        const tutorId = tutor[0].id;
        console.log(`Tutor ID: ${tutorId}`);

        console.log(`Step 2: Get Unique Students for Tutor ${tutorId}`);
        const [students] = await db.execute(`
            SELECT DISTINCT u.id, u.name, u.email, u.gsm
            FROM bookings b 
            JOIN user_data u ON b.student_id = u.id 
            WHERE b.tutor_id = ?
        `, [tutorId]);

        console.log(`Students found: ${students.length}`);
        console.log(students);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

verifyQuery();
