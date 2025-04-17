require("dotenv").config();
console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
const mysql = require("mysql2");


// Create Connection
const db = mysql.createPool({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database Connection Failed:", err.message);
        process.exit(1);  // Exit if DB fails
    } else {
        console.log("✅ Database connected!");
        connection.release(); // Release connection back to pool
    }
});

module.exports = db;
