const express = require('express');
const bodyParser = require('body-parser')
const {query, body, check, validationResult} = require('express-validator')
const cors = require('cors');
const config = require('config');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const allowMethods = require('./allowMethods');
const { jwtAuth } = require('./jwtAuth');
const PortfolioDBConnection = require('./PortfolioDBConnection');


const app = express();
app.use(cors({credentials: true, origin: process.env.CORS_ALLOWED_ORIGIN}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const host = config.server.host;
const port = config.server.port;



function checkUser(user, password){
    if(typeof user != 'string' 
    && typeof password !== 'string'){
        return false;
    }

    const dbConnection = new PortfolioDBConnection();
    dbConnection.init()
    return dbConnection.login(user, password).then(accepted => {
        return accepted;
    })
}

function addGenre(genre){
    if(typeof genre != 'string'){
        return false;
    }
    const dbConnection = new PortfolioDBConnection();
    dbConnection.init();
    return dbConnection.addGenre(genre).then(accepted => {
        return accepted
    })
}

function getAllGenres(){
    const dbConnection = new PortfolioDBConnection();
    dbConnection.init();
    return dbConnection.getAllGenres().then(data => {
        return data;
    })
}

function generateToken(){
    const token = crypto.randomBytes(64).toString('hex');
    return token;
}

function generateExpireDate(){
    const time = new Date().getTime()
    return time  + Number(process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS)*1000;
}

function refreshTokens(req, res, refreshToken, newUser=undefined){
        if(refreshToken !== req?.cookies?.token?.refreshToken){
            return req.status(405).json({status: false, message: "RefreshToken invalid"});
        }
        
        if(newUser === undefined){
            newUser = req?.cookies?.token?.user
        }
        
        const jwtoken = jwt.sign({newUser}, process.env.TOKEN_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
      
        tokenJSON = {
            "refreshToken": req?.cookies?.token?.refreshToken,
            "refreshExpiresAt": req?.cookies?.token?.refreshExpiresAt,
            newUser,
            "jwt": jwtoken
        }

        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials', true);
        
        return res.cookie("token", tokenJSON, {
            httpOnly: true,
        });
}

app.get('/login',
[query('user')
.escape()
.notEmpty()
.withMessage('Only letters with numerical values allowed.')
.isLength({min: 3, max:32}).withMessage('Username is too long or too short.')
.matches(/^[A-Za-z0-9 .,'!&]+$/),
query('password')

.notEmpty()
.withMessage('Password needs to be a string.')
.matches(/^[A-Za-z0-9 .,'!&]+$/)
.isLength({min:3, max:48}).withMessage('Password is too long or too short.')], function (req, res)  {
    allowMethods(req, res, () => {
        const user = req.query.user;
        const password = req.query.password;
        checkUser(user, password).then(accepted => {
           if(!accepted){
                return res.status(403).json({
                    status: false,
                    message: "wrong credentials",
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
            }).status(200).json({status: true, message: "Successful login"});
            
        }else{
            return res.status(200).json({status: true, message: "Already logged in"});
            
        }
        }).catch(err => {
            return res.status(403).json({
                status: false,
                message: "wrong credentials",
            });
        })
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
                const refreshed = refreshTokens(req, res, refreshToken);
                refreshed.status(200).json({status: true, message: "Authorized", action: "New JWT, there u go!"});
            }, ()=>{
                return res.status(200).json({status: true, message: "Authorized"});
        })
    })
})

app.post('/createBlog',
[
    body('title')
        .notEmpty().withMessage('title is empty')
        .isLength({min: 3, max: 69}).withMessage('title is to large or to small'),
    body('subtitle')
        .notEmpty().withMessage('subtitle is empty')
        .isLength({min: 3, max: 69}).withMessage('subtitle is to large or to small'),
    body('text')
        .notEmpty().withMessage('text is empty')
        .isLength({min: 3}).withMessage('text is to small'),
    body('additionaltext')
        .notEmpty().withMessage('teadditionaltextxt is empty')
        .isLength({min: 3}).withMessage('additionaltext is to small')
], function(req, res){
    allowMethods(req, res, () => {
        jwtAuth(req, res,
            (refreshToken) => {
                const refreshed = refreshTokens(req, res, refreshToken);
                refreshed.status(200).json({status: true, message: "Authorized", action: "Added new blog entry"});
                
            }, ()=>{
                return res.status(200).json({status: true, message: "Authorized", action: "Added new blog entry"});
        })
    })
})

app.post('/createGenre',[
    check('genre').notEmpty().withMessage('Genre is empty')
    .isLength({min: 3, max: 69}).withMessage('Genre is too long or to small')
    .escape()
], function(req, res){
    let err = validationResult(req)
    if(!err.isEmpty()){
        return res.status(200).json({status: false, message: err.mapped().genre.msg});
    }

    allowMethods(req, res, () => {
        jwtAuth(req, res, (refreshToken) => {
            const refreshed = refreshTokens(req, res, refreshToken);
            addGenre(req.body.genre).then(() => {
                return refreshed.status(200).json({status: true, message: `Added ${req.body.genre} successfully`, action: "Added new genre"});
            }).catch((err) => {
                return res.status(200).json({status: false, message: err})
            })

            
        }, () => {
            addGenre(req.body.genre).then(() => {
                return res.status(200).json({status: true, message: `Added ${req.body.genre} successfully`, action: "Added new genre"});
                    
                
            }).catch((err) => {
                return res.status(200).json({status: false, message: err})
            })
           
        })
    })
})

app.get('/genres', function(req, res){
    allowMethods(req, res, () => {
        jwtAuth(req, res,  (refreshToken) => {
            const refreshed = refreshTokens(req, res, refreshToken);
            getAllGenres().then(data => {
                return refreshed.status(200).json({status: true, data: data})
            }).catch(() => {
                return refreshed.status(200).json({status: false, data: "failed to get data"})
            })
            
        }, () => {
            getAllGenres().then(data => {
                return res.status(200).json({status: true, data: data})
            }).catch(() => {
                return res.status(200).json({status: false, data: "failed to get data"})
            })
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