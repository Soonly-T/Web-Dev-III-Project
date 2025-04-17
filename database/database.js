
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'appinfo');

const db=new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  }
  else {
    console.log('Connected to the SQLite database.');
    
  }  
})
console.log('Database path being used:', dbPath); // Add this line
module.exports = db;







// db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, tables) => {
//   if (err) {
//     console.error('Error fetching table names: ' + err.message);
//   } else {
//     tables.forEach(table => {
//       const tableName = table.name;
//       db.all(`PRAGMA table_info(${tableName});`, [], (err, rows) => {
//         if (err) {
//           console.error(`Error fetching headers for table ${tableName}: ` + err.message);
//         } else {
//           const headers = rows.map(row => row.name);
//           console.log(`Table: ${tableName}, Headers:`, headers);
//         }
//       });
//     });
//   }
// });


