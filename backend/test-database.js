const db = require("./database");

console.log("Database connected successfully.");

const tables = db
  .prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name;
  `)
  .all();

console.log("Tables:");
console.log(tables);