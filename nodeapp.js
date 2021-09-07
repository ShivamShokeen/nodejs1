var http = require('http');
var mysql = require('mysql');
const express = require('express');
const { element } = require('protractor');
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
;var urlencodedparse = express.urlencoded({ extended: true});
var parseJSon = express.json();
var app = express();
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
            arrayData.forEach((element) =>{
                console.log("f",element.image.data);
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

// urlencodedparse
app.post('/add-registration', parseJSon, (req, res) => {
    connection.query("SELECT * FROM registrations", (err, rows, field) => {
        if (err) {
            res.send(err);
        }

        if (!err) {
            let arrayData = Object.values(JSON.parse(JSON.stringify(rows)));
            if (arrayData.length > 0) {
                let findData = arrayData.find((value) => value.email == req.body.email);
                console.log("findData", findData);
                if (findData == undefined) {
                    connection.query("INSERT INTO registrations(name,email,password) VALUES ('" + req.body.name + "', '" + req.body.email + "', '" + req.body.password + "');"), (err) => {
                        if (err) {
                            console.log('registration', err)
                            res.send(err);
                        }
                        if (!err) {
                            console.log("Add Registration api hit");
                            res.status(200).send('Success');
                        }
                    }
                }
                else {
                    res.status(401).end('Email ID Exist');
                }
            }
            else {
                connection.query("INSERT INTO registrations(name,email,password) VALUES ('" + req.body.name + "', '" + req.body.email + "', '" + req.body.password + "');"), (err) => {
                    if (err) {
                        console.log('registration', err)
                        res.send(err);
                    }
                    if (!err) {
                        console.log("Add Registration api hit");
                        res.status(200).send('Success');
                    }
                }
            }
        }
    })
});

app.post('/verify-login',parseJSon,(req,res) =>{
    console.log("login",req.body);

    connection.query("SELECT * FROM registrations", (err,rows,field) =>{
        if(err){
            res.send(err);
        }

        if(!err){
            console.log("reg data",rows);
            res.send(rows);
        }

        console.log("reg data",rows);
    })
});

app.listen(9000, () => {})

// http.createServer((req,res)=>{
//     if(req.url == '/get-registration'){
//         res.writeHead(200,{'Content-Type' : 'application/json'});
//         connection.query('SELECT * FROM registrations', function(err, rows, fields) {
//             if(err){
//                 console.log("Registration api hit");
//                 console.log("An error ocurred performing the query.");
//                 return;
//             }
//             const result = Object.values(JSON.parse(JSON.stringify(rows)));
//             res.end(rows);
//         });

//     }
// }).listen(9001);
