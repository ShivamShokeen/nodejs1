var mysql = require('mysql');
const express = require('express');

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var app = express();
var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
var cors = require('cors');
const tokenConfig = require('./tokenConfig');
const jwtRoute = require('./noderoutes/jwt');
const userRoute = require('./noderoutes/user');
app.use(cors());

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

// routes
app.use('/user',userRoute);
app.use('/jwt', jwtRoute);
// routes ends


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




app.listen(9000, () => { });