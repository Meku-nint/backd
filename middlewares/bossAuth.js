import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY_MANAGER;

const BossAuth = (req, res, next) => {

    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({ message: 'No Authorization Header' });
    }

    const token = authorization.startsWith('Bearer ') ? authorization.split(' ')[1] : null;
    if (!token) {
        return res.status(401).json({ message: 'Invalid Token Format' });
    }

    try {
       
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Session Expired', error: error.message });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid Token', error: error.message });
        }

        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
export default BossAuth;
