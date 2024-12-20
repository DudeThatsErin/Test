// dummy db
const mysql = require('mysql2');
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DUMMY_DBHOST,
    user: process.env.DUMMY_DBUSERNAME,
    password: process.env.DUMMY_DBPW,
    database: process.env.DUMMY_DB
});
const promisePool = pool.promise();
module.exports = promisePool;