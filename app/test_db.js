const mysql = require('mysql2/promise');

(async () => {
    const hosts = ['studyium.com', '185.199.108.153', 'sql.studyium.com', 'mysql.hostinger.com', '139.179.30.24'];

    for (const host of hosts) {
        console.log(`Trying to connect to ${host}...`);
        try {
            const conn = await mysql.createConnection({
                host: host,
                user: 'u302174108_egeceylan',
                password: 'HelloWorld!21',
                database: 'u302174108_users_data',
                connectTimeout: 5000
            });
            console.log(`SUCCESS: Connected to ${host}!`);
            const [rows] = await conn.execute('SELECT COUNT(*) as c FROM user_data');
            console.log('Query Result:', rows);
            await conn.end();
            process.exit(0); // Success
        } catch (e) {
            console.error(`FAILED to connect to ${host}:`, e.message);
        }
    }
    console.error("All connection attempts failed.");
    process.exit(1);
})();
