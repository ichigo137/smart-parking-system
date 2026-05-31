const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.db", (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("✅ SQLite Connected");
    }
});

db.run(`
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT,
    email TEXT,
    phone TEXT,

    vehicleNumber TEXT,
    vehicleType TEXT,

    slot TEXT,
    floor TEXT,

    plan TEXT,
    amount INTEGER,

    txn TEXT,
    entryTime TEXT
)
`);

module.exports = db;