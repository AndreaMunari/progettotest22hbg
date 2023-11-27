const mysql = require('mysql');

//set-up connection to mysql database
var connection = mysql.createConnection({
    host: 'sql11.freesqldatabase.com',
    database: 'sql11665118',
    user: 'sql11665118',
    password: 'dVDge2Iq4L',
    port: 3306
});

//try connecting to database
connection.connect((error)=>{
    if(error) {
        console.log("MySQL Database connection failed")
        throw error;
    } else {
        console.log("MySQL Database connected successfully")
    }
});

module.exports = connection;