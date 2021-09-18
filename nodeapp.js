var mysql = require('mysql');
const express = require('express');
const {env} = './src/environments/environment.prod.ts';

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var app = express();
var parseJSon = express.json();
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
var cors = require('cors');
app.use(cors());

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

// Middleware starts

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const accessTokenSecret ='c6f6a6aff6f81ba0a6a121542ea81a9f332fa654989ab5b9989d9e6963a701c36d3190e5365693ad6ad3d703eb0dd1cf0da5a89494764031369d4ad0';  
    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Middleware ends


app.get('/get-games', authenticateJWT, (rep, res) => {
    connection.query('SELECT * FROM add_game', (err, rows, fields) => {
        if (err) {
            res.send(err);
        }
        if (!err) {
            let arrayData = Object.values(JSON.parse(JSON.stringify(rows)));
            // console.log("rows",rows);
            console.log("arrayData",arrayData)
            if(arrayData.length > 0){
                     var base64data = Buffer.from(element.image.data).toString('base64');
                    // element.image.data = base64data; }
                var base64data = Buffer.from(arrayData[0].image.data).toString('base64');
                // console.log("base64data",base64data);
                // console.log("rows",rows.RowDataPacket.image);
                res.send(arrayData);    
            }
            else{
                res.send([]);
            }
            console.log("Get Games api hit");
            
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
                        res.send({email: req.body.email, name: req.body.name, datetime: req.body.datetime});
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
                    const singJWTToken = jwt.sign({ email: getEmail.email, name: getEmail.name, datetime: getEmail.datetime },'c6f6a6aff6f81ba0a6a121542ea81a9f332fa654989ab5b9989d9e6963a701c36d3190e5365693ad6ad3d703eb0dd1cf0da5a89494764031369d4ad0');
                    
                    res.status(200).send({ email: getEmail.email, name: getEmail.name, datetime: getEmail.datetime,token : singJWTToken });
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