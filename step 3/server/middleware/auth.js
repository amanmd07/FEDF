const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
    if (typeof roles === 'string') roles = [roles];
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'No token' });
        const token = authHeader.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = payload;
            if (roles.length && !roles.includes(payload.role)) return res.status(403).json({ message: 'Forbidden' });
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
};

module.exports = auth;
