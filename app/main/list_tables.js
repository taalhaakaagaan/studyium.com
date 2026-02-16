const db = require('./db');

async function listTables() {
    try {
        const [rows] = await db.execute("SHOW TABLES");
        console.log("Tables:", rows.map(r => Object.values(r)[0]));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

listTables();
