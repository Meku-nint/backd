import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

const Auth = (req, res, next) => {
    console.log("Auth middleware called");

    const authorization = req.headers.authorization;
    if (!authorization) {
        console.log("No Authorization Header found");
        return res.status(401).json({ message: 'No Authorization Header' });
    }

    const token = authorization.startsWith('Bearer ') ? authorization.split(' ')[1] : null;
    if (!token) {
        console.log("Invalid Token Format:", authorization);
        return res.status(401).json({ message: 'Invalid Token Format' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("Token decoded successfully:", decoded);
        req.user = decoded; // attach payload
        next();
    } catch (error) {
        console.log("Error verifying token:", error);

        if (error instanceof jwt.TokenExpiredError) {
            console.log("TokenExpiredError:", error.message);
            return res.status(401).json({ message: 'Session Expired', error: error.message });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            console.log("JsonWebTokenError:", error.message);
            return res.status(401).json({ message: 'Invalid Token', error: error.message });
        }

        console.log("Unknown error in Auth middleware:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export default Auth;
