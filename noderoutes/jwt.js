const express = require('express');
var app = express();
const jwtController  = require('../nodeController/jwtController');
var parseJSon = express.json();

app.post('/verify_login',parseJSon,jwtController.verifyToken);
app.post('/refresh_token',parseJSon,jwtController.refreshToken);


module.exports = app;
// http://localhost:9000/jwt/refresh_token
// http://localhost:9000/jwt/verify_login

