import jwt from 'jsonwebtoken';
export function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.slice(7)
            : req.cookies?.token;
        if (!token) {
            res.setHeader('WWW-Authenticate', 'Bearer');
            return res.status(401).json({ message: 'Unauthorized: missing token' });
        }
        const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'replace_me_dev_only' : '');
        if (!secret)
            throw new Error('JWT_SECRET not configured');
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        return next();
    }
    catch (err) {
        const code = err?.name === 'TokenExpiredError' ? 401 : 401;
        const reason = err?.message || 'invalid token';
        res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
        return res.status(code).json({ message: 'Unauthorized', reason });
    }
}
