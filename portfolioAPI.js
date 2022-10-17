const express = require('express');
const cors = require('cors');
const config = require('config');
const cookieParser = require('cookie-parser');
const dayjs = require('dayjs');
const crypto = require('crypto');

const requestmethods = require('./requestmethods');

const app = express();
app.use(cors());
app.use(cookieParser());

const host = config.server.host;
const port = config.server.port;

function checkUser(user, password){
    return (user === config.account.user && password === config.account.password);
}

function generateToken(){
    const token = crypto.randomBytes(64).toString('hex');
    return JSON.parse(`{"token": "${token}"}`);
}

app.get('/login', function (req, res)  {

    requestmethods(req, res, () => {})

    const user = req.query.user;
    const password = req.query.password;

    if(!req.cookies || !req.cookies.secureCookie){
        if (checkUser(user, password)){
            const token = generateToken();

            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.setHeader('Access-Control-Allow-Credentials', true);

            return res.cookie("secureCookie", JSON.stringify(token), {
                secure: process.env.NODE_ENV !== "development",
                httpOnly: true,
                expires: dayjs().add(1, "days").toDate(),
            }).status(200).send(true);
            
        }else{
            return res.status(200).send(false);
            
        }
    }else{
        return res.status(200).send(true);
        
    }
})

app.get('/logout', function(req, res){

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);

    if(req.cookies || req.cookies.secureCookie){
        return res.clearCookie("secureCookie").status(200).send(true)
    }else{
        return req.status(405).send(false);
    }
})

app.get('/status', function(req, res){

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    if(req.cookies.secureCookie !== undefined){
         res.status(200).send(true)
         return
    }
    res.send(false)
    return;
})

app.listen(port, host, (error) => {
    if(error){
        console.error("Portfolio API failed to start: ", error);
        process.exit(1);
    }
    console.log(`Portfolio API is running on ${host}:${port}`)
})  