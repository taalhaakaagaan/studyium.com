const db = require('./db');

async function checkEnrollments() {
    try {
        const [tables] = await db.execute("SHOW TABLES LIKE 'enrollments'");
        if (tables.length > 0) {
            const [desc] = await db.execute("DESCRIBE enrollments");
            console.log("Enrollments Schema:", desc.map(c => c.Field));
            const [data] = await db.execute("SELECT * FROM enrollments WHERE student_id = 67");
            console.log("Enrollments for 67:", data);
        } else {
            console.log("No enrollments table.");
            // Check if there is another way, maybe `user_tutors`?
            const [tables2] = await db.execute("SHOW TABLES");
            console.log("Tables:", tables2.map(t => Object.values(t)[0]));
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkEnrollments();
