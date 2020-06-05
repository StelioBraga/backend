const {Pool} = require("pg");


const pool = new Pool();
console.log("Creating your table...")

pool.query(`CREATE TABLE users (
        name varchar(30),
        email varchar(60)
    )`, (error, response) => {

        if(error) {
            console.log("An error occured while setting up your server:")
            console.log(error)
        } else {
            console.log("Table succesfully created.")
        }
    });

