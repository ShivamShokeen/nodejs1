const express = require('express');
var app = express();
const userController = require('../nodeController/userController');
var parseJSon = express.json();

app.post('/register_user',parseJSon,userController.registerUser);


module.exports = app;
// http://localhost:9000/jwt/refresh_token
// http://localhost:9000/jwt/verify_login

