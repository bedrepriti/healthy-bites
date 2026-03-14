const mysql = require("mysql2");

// Pool variable
let pool;

if (process.env.DATABASE_URL) {
  // Production / Render → use Railway public URL
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  // Local development → use individual variables
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

module.exports = pool;
