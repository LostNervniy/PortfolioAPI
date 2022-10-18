const express = require('express');
const cors = require('cors');
const config = require('config');
const cookieParser = require('cookie-parser');
const dayjs = require('dayjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const allowMethods = require('./allowMethods');
const { jwtAuth } = require('./jwtAuth');

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
    return token;
}

function generateExpireDate(){
    const time = new Date().getTime()
    return time  + Number(process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS)*1000;
}

app.get('/login', function (req, res)  {
    allowMethods(req, res, () => {
        const user = req.query.user;
        const password = req.query.password;
    
        if(!checkUser(user, password)){
            return res.status(403).json({
                error: "wrong credentials"
            });
        }
    
        if(!req.cookies || !req.cookies.token){
            const refreshToken = generateToken();
            const jwtoken = jwt.sign({user}, process.env.TOKEN_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
     
            tokenJSON = {
                "refreshToken": refreshToken,
                "refreshExpiresAt": generateExpireDate(),
                user,
                "jwt": jwtoken
            }
    
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.setHeader('Access-Control-Allow-Credentials', true);
    
            return res.cookie("token", tokenJSON, {
                httpOnly: true,
            }).status(200).send(true);
            
        }else{
            return res.status(200).send(true);
            
        }
    })

    
})

app.get('/logout', function(req, res){

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);

    if(req.cookies || req.cookies.token){
        return res.clearCookie("token").status(200).send(true)
    }else{
        return req.status(405).send(false);
    }
})

app.get('/status', function(req, res){
    allowMethods(req, res, () => {
        jwtAuth(req, res,
            (refreshToken) => {
                if(refreshToken !== req?.cookies?.token?.refreshToken){
                    return req.status(405).send(false);
                }
    
                const user = req?.cookies?.token?.user
                const jwtoken = jwt.sign({user}, process.env.TOKEN_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
              
                tokenJSON = {
                    "refreshToken": req?.cookies?.token?.refreshToken,
                    "refreshExpiresAt": req?.cookies?.token?.refreshExpiresAt,
                    user,
                    "jwt": jwtoken
                }
        
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
                res.setHeader('Access-Control-Allow-Credentials', true);
                
                return res.cookie("token", tokenJSON, {
                    httpOnly: true,
                }).status(200).send(true);
            }, ()=>{
                return res.status(200).send(true);
        })
    })
})

app.listen(port, host, (error) => {
    if(error){
        console.error("Portfolio API failed to start: ", error);
        process.exit(1);
    }
    console.log(`Portfolio API is running on ${host}:${port}`)
})  