const db = require('./db');

async function checkTopics() {
    try {
        const [desc] = await db.execute("DESCRIBE topics");
        console.log("Topics Columns:", desc.map(c => c.Field));

        const [topics] = await db.execute("SELECT * FROM topics WHERE id IN (43, 51, 52)");
        console.log("Topics found with IDs 43, 51, 52:", topics.length);
        topics.forEach(t => console.log(t));

        // Also check one booking to see if we can find a relation
        const [booking] = await db.execute("SELECT lesson_id FROM bookings WHERE student_id = 67 LIMIT 1");
        console.log("Sample Booking Lesson ID:", booking[0]?.lesson_id);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkTopics();
