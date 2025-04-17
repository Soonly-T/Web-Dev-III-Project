const jwt=require('jsonwebtoken')
require('dotenv').config();

const generateAccessToken=(user)=>{
    const payload={
        id:user.ID,
        username:user.USERNAME,
        email:user.EMAIL
    }
    console.log(payload)
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '1h' };
    return jwt.sign(payload,secret,options)

}

const verifyAccessToken=(token)=>{
    const secret= process.env.JWT_SECRET;
    try {
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (err) {
        console.error('Token verification failed:', err);
        return null;
    }
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = verifyAccessToken(token);

    if (decodedToken) {
        req.user = decodedToken;
        next();
    } else {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
module.exports={generateAccessToken, verifyAccessToken, authenticateToken}

