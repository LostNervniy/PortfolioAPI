/**
 * 
 * @param {REQUEST} req 
 * @param {RESPONSE} res 
 * @param {CALLBACK} next Callback function for destitinated request call
 */
function allowMethods(req, res, next){
       const allowedMethods = [
        "OPTIONS",
        "HEAD",
        "CONNECT",
        "GET",
        "POST",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
    ]

    if(!allowedMethods.includes(req.method)){
        return res.status(405).json({error: `${req.method} not allows.`});
    } 

    next();
}

module.exports = allowMethods;