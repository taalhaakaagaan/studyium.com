const db = require('./db');

async function checkLessonSchema() {
    try {
        const [rows] = await db.execute("SELECT * FROM lessons LIMIT 1");
        console.log("Lesson columns:", Object.keys(rows[0]));
        console.log("Sample lesson:", rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkLessonSchema();
