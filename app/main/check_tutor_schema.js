const db = require('./db');

async function checkSchema() {
    try {
        const [rows] = await db.execute("SELECT * FROM tutors LIMIT 1");
        console.log("Tutor columns:", Object.keys(rows[0]));
        console.log("Sample tutor:", rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkSchema();
