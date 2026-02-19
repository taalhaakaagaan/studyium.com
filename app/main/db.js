const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'studyium.com', // or IP if needed
    user: 'u302174108_egeceylan',
    password: 'HelloWorld!21',
    database: 'u302174108_users_data',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});

module.exports = pool;
