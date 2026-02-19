const db = require('./db');

async function checkExists() {
    try {
        const [tutors] = await db.execute("SELECT id, user_id FROM tutors WHERE id = 28");
        console.log("Tutor 28:", tutors.length > 0 ? "Exists" : "MISSING");
        if (tutors.length > 0) console.log("Tutor details:", tutors[0]);

        const [lessons] = await db.execute("SELECT id, name FROM lessons WHERE id IN (43, 51, 52)");
        console.log("Lessons found:", lessons.length);
        lessons.forEach(l => console.log(`Lesson ${l.id}: ${l.name}`));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkExists();
