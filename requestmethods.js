function allowedmethods(req, res, next){
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
        res.status(405).send(`${req.method} not allows.`);
    }

    next();
}

module.exports = allowedmethods;