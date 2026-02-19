const db = require('./db');

async function checkSchema() {
    try {
        const [desc] = await db.execute("DESCRIBE weekly_schedules");
        console.log("Weekly Schedules Columns:", desc.map(c => `${c.Field} (${c.Type})`));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkSchema();
