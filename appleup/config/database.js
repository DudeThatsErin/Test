// appleup db
const mysql = require('mysql2');
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.APPLEUP_DBHOST,
    user: process.env.APPLEUP_DBUSERNAME,
    password: process.env.APPLEUP_DBPW,
    database: process.env.APPLEUP_DB
});
const promisePool = pool.promise();
module.exports = promisePool;