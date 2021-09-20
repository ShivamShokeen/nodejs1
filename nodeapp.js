var mysql = require('mysql');
const express = require('express');

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var app = express();
var parseJSon = express.json();
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
var cors = require('cors');
const tokenConfig = require('./tokenConfig');
const {check} = require('express-validator');
app.use(cors());
const tokenList = {};

var connection = mysql.createConnection({
    host: '',
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

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, tokenConfig.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log("User is forbidden");
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
    connection.query('SELECT * FROM gameList', (err, rows, fields) => {
        if (err) {
            res.send(err);
        }
        if (!err) {
            let arrayData = Object.values(JSON.parse(JSON.stringify(rows)));
            // console.log("rows",rows);
            console.log("arrayData", arrayData)
            if (arrayData.length > 0) {
                var base64data = Buffer.from(element.image.data).toString('base64');
                // element.image.data = base64data; }
                var base64data = Buffer.from(arrayData[0].image.data).toString('base64');
                // console.log("base64data",base64data);
                // console.log("rows",rows.RowDataPacket.image);
                res.send(arrayData);
            }
            else {
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

                    const signJWTToken = jwt.sign(registerPayload, tokenConfig.ACCESS_TOKEN_SECRET, { expiresIn: tokenConfig.token_expire });

                    const refreshToken = jwt.sign(registerPayload, tokenConfig.REFRESH_TOKEN_SECRET, { expiresIn: tokenConfig.refresh_token_expire });

                    console.log("Token refreshed", refreshToken);

                    const response = {
                        status: 'Logged in',
                        token: signJWTToken,
                        refreshToken: refreshToken,
                    }

                    // tokenList[refreshToken] = response;
                    registerPayload['sign_token'] = signJWTToken;
                    registerPayload['refresh_token'] = refreshToken;

                    connection.query("INSERT INTO registrations SET ?", registerPayload, (err, rows) => {
                        if (!err) {
                            console.log("Add Registration api hit");
                            connection.query("SELECT * FROM registrations", (err, rows, field) => {
                                if (err) {
                                    res.send(err);
                                }

                                if (!err) {
                                    let arrayData = Object.values(JSON.parse(JSON.stringify(rows)));

                                    if (arrayData.length > 0) {
                                        let getData = arrayData.find((value) => value.email == registerPayload.email);
                                        res.send(getData);
                                    }
                                }
                            })
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
                const signJWTToken = jwt.sign(registerPayload, tokenConfig.ACCESS_TOKEN_SECRET, { expiresIn: tokenConfig.token_expire });

                const refreshToken = jwt.sign(registerPayload, tokenConfig.REFRESH_TOKEN_SECRET, { expiresIn: tokenConfig.refresh_token_expire });

                console.log("Token refreshed", refreshToken);

                const response = {
                    status: 'Logged in',
                    token: signJWTToken,
                    refreshToken: refreshToken,
                }

                // tokenList[refreshToken] = response;
                console.log("signJWTToken", signJWTToken);
                console.log("refreshToken", refreshToken);
                registerPayload['sign_token'] = signJWTToken;
                registerPayload['refresh_token'] = refreshToken;

                console.log("registerPayload", registerPayload);
                connection.query("INSERT INTO registrations SET ?", registerPayload, (err, rows) => {
                    if (!err) {
                        connection.query("SELECT * FROM registrations", (err, rows, field) => {
                            if (err) {
                                res.send(err);
                            }

                            if (!err) {
                                let arrayData = Object.values(JSON.parse(JSON.stringify(rows)));
                                if (arrayData.length > 0) {
                                    let getData = arrayData.find((value) => value.email == registerPayload.email);
                                    res.send(getData);
                                }
                            }
                        })
                    } else {
                        console.log("Add Registration api hit with error else", err.message);
                        res.send(err);
                    }
                })
            }
        }
    })
});
// check().exists()
app.post('/refresh-token',parseJSon,(req,res) =>{
    connection.query("SELECT * FROM  registrations",(err,rows,fields) =>{
        console.log(req.body);
        if (err) {
            res.send(err);
        }
        if(!err){
            let arrayData = Object.values(JSON.parse(JSON.stringify(rows)));
            console.log("arrayData",arrayData)
            // // console.log(req.body);

            // let getToken = arrayData.find((value) => value.id == req.body.id);
            // console.log("getToken",getToken);

            const isVerify = jwt.verify(req.body.refresh_token,tokenConfig.ACCESS_TOKEN_SECRET,(err,payload) =>{
                console.log(payload);
                // console.log(err);
                if(err){
                    res.status(400).send(err);
                }
                else{
                    console.log(payload);
                    res.send('Succcess');
                }
                
            });
            // jwt.verify()

            console.log("isVerify",isVerify);

            // res.send('Succcess');
        }
    })
})

app.post('/verify-login', parseJSon, (req, res) => {
    connection.query("SELECT * FROM registrations", (err, rows, field) => {
        if (err) {
            res.send(err);
        }

        if (!err) {
            let arrayData = Object.values(JSON.parse(JSON.stringify(rows)));

            getEmail = arrayData.find((value) => value.email == req.body.email);
            if (getEmail != undefined) {
                // console.log("getEmail", getEmail);
                const isValidPass = bcrypt.compareSync(req.body.password, getEmail.password);
                if (isValidPass == true) {

                    let verifyPayload = { id: getEmail.id, email: getEmail.email, name: getEmail.name, dateCreation: getEmail.dateCreation, sign_token: getEmail.sign_token, refresh_token: getEmail.refresh_token };

                    const signJWTToken = jwt.sign(verifyPayload, tokenConfig.ACCESS_TOKEN_SECRET, { expiresIn: tokenConfig.token_expire });

                    const refreshToken = jwt.sign(verifyPayload, tokenConfig.REFRESH_TOKEN_SECRET, { expiresIn: tokenConfig.refresh_token_expire });

                    verifyPayload['sign_token'] = signJWTToken;
                    verifyPayload['refresh_token'] = refreshToken;

                    var sqlUpdate = "UPDATE registrations set sign_token =? , refresh_token =?  WHERE id = ?";

                    console.log("signJWTToken",signJWTToken);
                    connection.query(sqlUpdate, [signJWTToken, refreshToken, getEmail.id], (err, rows) => {
                        if (err) {
                            res.send(err);
                        }
                        if (!err) {
                            res.status(200).send({ id: getEmail.id, email: getEmail.email, name: getEmail.name, dateCreation: getEmail.dateCreation, sign_token: signJWTToken, refresh_token: refreshToken });
                        }
                    })


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