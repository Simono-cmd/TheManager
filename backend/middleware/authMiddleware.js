const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req,res,next) =>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access Denied: Incorrect Token' });
    }

    const token = authHeader.split(' ')[1];

    try{
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error){
        console.error("Token verification error", error.message);
        return res.status(403).json({message: "Incorrect token error"});
    }


}