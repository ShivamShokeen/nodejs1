var mysql = require('mysql');
const express = require('express');

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var app = express();
var parseJSon = express.json();
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'firstDatabase',
    password: 'test1234',
    database: 'firstdb'
});

connection.connect(function (err) {
    // in case of error
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    }
});

app.get('/get-registration', (rep, res) => {
    connection.query('SELECT * FROM registrations', (err, rows, fields) => {
        if (err) {
            console.log('registration', err)
            res.send(err);
        }
        if (!err) {
            console.log("Registration api hit");
            res.send(rows);
        }
    })
});


app.get('/get-games', (rep, res) => {
    connection.query('SELECT * FROM add_game', (err, rows, fields) => {
        if (err) {
            res.send(err);
        }
        if (!err) {
            let arrayData = Object.values(JSON.parse(JSON.stringify(rows)));
            // console.log("rows",rows);
            arrayData.forEach((element) => {
                var base64data = Buffer.from(element.image.data).toString('base64');
                // element.image.data = base64data;
            })
            var base64data = Buffer.from(arrayData[0].image.data).toString('base64');
            // console.log("base64data",base64data);
            // console.log("rows",rows.RowDataPacket.image);
            console.log("Get Games api hit");
            res.send(arrayData);
        }
    })
});

app.post('/add-registration', parseJSon, (req, res) => {
    // nodemailer
    let registerPayload = req.body;
    // Hash Password bycrypt starts
    const hash = bcrypt.hashSync(registerPayload.password, bcrypt.genSaltSync(10));
    registerPayload.password = hash;
    console.log("registerPayload", registerPayload);
    // Hash Password bycrypt ends

    connection.query("SELECT * FROM registrations", (err, rows, field) => {
        if (err) {
            res.send(err);
        }

        if (!err) {
            let arrayData = Object.values(JSON.parse(JSON.stringify(rows)));
            if (arrayData.length > 0) {
                let findData = arrayData.find((value) => value.email == registerPayload.email);
                if (findData == undefined) {
                    connection.query("INSERT INTO registrations SET ?", registerPayload, (err, rows) => {
                        if (!err) {
                            console.log("Add Registration api hit");
                            res.send('Successfully Registered');
                        } else {
                            console.log("Add Registration api hit with error", err.message);
                            res.send(err);
                        }
                    })
                }
                else {
                    res.status(401).end('Email ID Exist');
                }
            }
            else {
                console.log("execute");
                connection.query("INSERT INTO registrations SET ?", registerPayload, (err, rows) => {
                    if (!err) {
                        console.log("Add Registration api hit else");
                        res.send(rows);
                    } else {
                        console.log("Add Registration api hit with error else", err.message);
                        res.send(err);
                    }
                })
            }
        }
    })
});

app.post('/verify-login', parseJSon, (req, res) => {
    connection.query("SELECT * FROM registrations", (err, rows, field) => {
        if (err) {
            res.send(err);
        }

        if (!err) {
            let arrayData = Object.values(JSON.parse(JSON.stringify(rows)));

            getEmail = arrayData.find((value) => value.email == req.body.email);

            if (getEmail != undefined) {

                const isValidPass = bcrypt.compareSync(req.body.password, getEmail.password);

                if (isValidPass == true) {
                    res.status(200).send({ email: getEmail.email, name: getEmail.name, datetime: getEmail.datetime });
                }
                else {
                    res.status(400).end('Your password is wrong');
                }
            }

            if (getEmail == undefined) {
                res.status(400).end('Email id not exist');
            }
            console.log("Verify API hit");
        }
    })
});

app.listen(9000, () => { });