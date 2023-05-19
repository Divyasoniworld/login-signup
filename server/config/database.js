var mysql = require('mysql');

con = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
})

con.getConnection((error,connection)=> {
    if(!error){
        console.log('Database connected successfully');
        connection.release();
    }else{
        console.log("your database is not connect, please turn on phpmyadmin");
    }
  });

module.exports = con;