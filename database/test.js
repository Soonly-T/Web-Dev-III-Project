const sqlite3 = require('sqlite3').verbose();
const dbPath = '/home/soonly/Codes/flutter-dev-test/database/appinfo';
const tableName = 'USERS'; // Replace with the name of the table you want to inspect

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');

  db.all(`PRAGMA table_info(${tableName});`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      db.close();
      return;
    }
    console.log(`\n--- Schema for table: ${tableName} ---`);
    rows.forEach((row) => {
      console.log(`cid: ${row.cid}, name: ${row.name}, type: ${row.type}, notnull: ${row.notnull}, dflt_value: ${row.dflt_value}, pk: ${row.pk}`);
    });
    db.close();
  });
});