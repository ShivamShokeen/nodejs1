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

function verifyToken(req, res) {
    connection.query("SELECT * FROM registrations", (err, rows, field) => {
        if (err) {
            return res.send(err);
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

                    connection.query(sqlUpdate, [signJWTToken, refreshToken, getEmail.id], (err, rows) => {
                        if (err) {
                            return res.send(err);
                        }
                        if (!err) {
                            return res.status(200).send({ id: getEmail.id, email: getEmail.email, name: getEmail.name, dateCreation: getEmail.dateCreation, sign_token: signJWTToken, refresh_token: refreshToken });
                        }
                    })


                }
                else {
                    return res.status(400).end('Your password is wrong');
                }
            }

            if (getEmail == undefined) {
                return res.status(400).end('Email id not exist');
            }
            console.log("Verify API hit");
        }
    })
}

async function refreshToken(req, res) {

    let newTokens = await createNewToken({ id: req.body.id });
    console.log("newTokens", newTokens);

    jwt.verify(req.body.refresh_token, tokenConfig.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.log("err refreshToken", err);
            res.status(400).send(err);
        }
        else {
            payload.sign_token = newTokens.accessToken;
            payload.refresh_token = newTokens.refreshToken;
            console.log("payload", payload);
            var sqlUpdate = "UPDATE registrations set sign_token =? , refresh_token =?  WHERE id = ?";
            connection.query(sqlUpdate, [payload.sign_token, payload.refresh_token, payload.id], (err, rows) => {
                if (!err) {
                    res.send(payload);
                }
                else {
                    res.send(err);
                }
            })
        }

    });
}

function createNewToken(payload) {
    return new Promise(function (resolve, reject) {
        jwt.sign(payload, tokenConfig.ACCESS_TOKEN_SECRET, (err, accessToken) => {
            // console.log("accessToken",accessToken);
            if (err) reject('');
            jwt.sign(payload, tokenConfig.REFRESH_TOKEN_SECRET, (err, refreshToken) => {
                resolve({ accessToken: accessToken, refreshToken: refreshToken });
            })
        })
    })
}

module.exports = {
    verifyToken: verifyToken,
    refreshToken: refreshToken
}
