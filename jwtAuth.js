const jwt = require('jsonwebtoken');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} resend 
 * @param {*} next 
 * @returns 
 */
exports.jwtAuth = (req, res, resend, next) => {
    let refreshExpiresAt = 0;
    try{
        refreshExpiresAt = req?.cookies?.token?.refreshExpiresAt;
        if(refreshExpiresAt < new Date().getTime()){
            res.clearCookie('token');
            return res.status(403).json({
                status: false,
                message: "RefreshToken Expired"
            })
        }

        const refreshToken = req?.cookies?.token?.refreshToken;
        const token = req?.cookies?.token?.jwt;
        const user = jwt.verify(token, process.env.TOKEN_SECRET);

        req.user = {user, refreshToken, refreshExpiresAt};
        next();
    }catch(err){
        if(refreshExpiresAt > new Date().getTime()){
            console.log("refreshToken still valid. give out new jwt");
            resend(req?.cookies?.token?.refreshToken);
        }else{
            res.clearCookie('token');
            return res.status(403).json({
                status: false,
                message: "No valid token or something else"
            })
        }
    }   
}