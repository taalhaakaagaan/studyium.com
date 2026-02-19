const db = require('./db');

async function check() {
    try {
        const [rows] = await db.execute("SELECT DISTINCT status FROM bookings");
        console.log("Distinct statuses:", rows);

        const [examples] = await db.execute("SELECT * FROM bookings LIMIT 5");
        console.log("Example bookings:", examples);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();
