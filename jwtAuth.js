const jwt = require('jsonwebtoken');

exports.jwtAuth = (req, res, resend, next) => {
    let refreshExpiresAt = 0;
    try{
        refreshExpiresAt = req?.cookies?.token?.refreshExpiresAt;
        if(refreshExpiresAt < new Date().getTime()){
            res.clearCookie('token');
            return res.status(403).json({
                error: "RefreshToken Expired"
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
            /*
            return res.status(403).json({
                error: "JWT Expired, refreshToken valid"
            })
            */
        }else{
            res.clearCookie('token');
            return res.status(403).json({
                error: "JWT expired or something else happend"
            })
        }
    }   
}