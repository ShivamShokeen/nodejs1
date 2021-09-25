var mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenConfig = require('../tokenConfig');

var connection = mysql.createConnection({
    host: '',
    user: 'firstDatabase',
    password: 'test1234',
    database: 'firstdb'
});

connection.connect(function (err) {
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    }
});

function registerUser(req, res) {
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
                    // coz we are login directly on save
                    const signJWTToken = jwt.sign(registerPayload, tokenConfig.ACCESS_TOKEN_SECRET, { expiresIn: tokenConfig.token_expire });

                    const refreshToken = jwt.sign(registerPayload, tokenConfig.REFRESH_TOKEN_SECRET, { expiresIn: tokenConfig.refresh_token_expire });

                    console.log("Token refreshed", refreshToken);

                    const response = {
                        status: 'Logged in',
                        token: signJWTToken,
                        refreshToken: refreshToken,
                    }

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
}

module.exports = {
    registerUser: registerUser
}