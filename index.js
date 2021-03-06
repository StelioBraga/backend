const cors = require('cors');
const express = require('express');
const { Pool, Client } = require('pg');
const sendgridMail = require('@sendgrid/mail');
const xl = require('excel4node');
const env = require('dotenv')
const Mailgun = require('mailgun-js');


env.config();
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
var mailgun = new Mailgun({apiKey:process.env.MAILGUN_API_KEY, domain:process.env.MAILGUN_DOMAIN});

//send email
function sendEmail( name, email) {
// msg container
const emailContainer = {
    to:'steliobraga13@gmail.com',
    from:'kcruz@paytech.tech',
    subject:'new user created',
    text:'The user '+ name +' wiht email:'+ email +' has been join.' ,
};
//sendgridMail.send(emailContainer);
mailgun.messages().send(emailContainer)
}

/**
 * Transforms database query results into .xlsx (Excel formatted file)
 * @param {JSON} rows the rows from the queried table.
 */
const createSheet = (rows, res) => {
    const workbook = new xl.Workbook();
    const sheet = workbook.addWorksheet('Users')
    // add data to the sheet
    // 1. Header
    sheet.cell(1,1).string('Nome')
    sheet.cell(1,2).string('Email')

    // 2. Add data
    rows.forEach((user, index) => {
        const name = user.name;
        const email = user.email;

        sheet.cell(index + 2, 1).string(name); // row: index+2, col: 1 (Name)
        sheet.cell(index + 2, 2).string(email); // row: index+2, col: 2 (Email)
    });

    // And finally.. write it into the filesystem.
    workbook.write("Users.xlsx", res);
}

// pools will use environment variables
// for connection information
const pool = new Pool()

const app = express();
app.use(cors())
app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.post('/api/user', function(req, res) {
   // console.log(req.body);
   
    const name = req.body.name;
    const email = req.body.email;
    pool.query("INSERT INTO users values($1, $2)", [name,email], (error, result) => {
        if(error){
           console.log(error);
        }else{
            console.log("User created successfully")
           sendEmail(name,email)
           res.sendStatus(200).end;
        }
    })
    
});

app.get("/api/user", function (req, res) {
    // Get the data from db
    pool.query("SELECT * FROM users", function(err, resp) {
        if (err) {
            res.send("An error occured while selecting users.")
            console.log(err)

        } else {
            // Got data!
            const rows = resp.rows;
            createSheet(rows, res)
        }
    })
});

const port = 8081
app.listen(port, () => console.log(`Server started: http://localhost:${port}`));