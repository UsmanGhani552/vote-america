const jwt = require('jsonwebtoken');

const verifyToken = async (req,res,next) => {
    const token = req.body.token || req.query.token || req.headers['authorization'];

    if(!token){
        res.status(401).send({
            status:'success',
            message:'Token is required',
        });
    }
    try{
        const decode = jwt.verify(token,'secret_key');
        req.user = decode;
        return next();
    }catch(error){
        res.status(400).send({message:'Invalid Token'});
    }
    
}

module.exports = {
    verifyToken,
};