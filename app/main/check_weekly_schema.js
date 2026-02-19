const db = require('./db');
async function checkWeekly() {
    try {
        const [rows] = await db.execute("SELECT * FROM weekly_schedules LIMIT 1");
        console.log("Weekly Schedule columns:", Object.keys(rows[0] || {}));
        const [desc] = await db.execute("DESCRIBE weekly_schedules");
        console.log("Description:", desc);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
checkWeekly();
