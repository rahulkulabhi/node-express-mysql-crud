const Sequelize = require("sequelize");

const sequelize = new Sequelize('node_crud', 'root', 'Ghuntu@2014', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;

/*
// normal MySQL2
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: 'localhost',
    user: "root",
    password: "Rahul@cispl1",
    database: "node_crud"
});

module.exports = pool.promise();
*/
