export function setCache(seconds) {
    const value = `private, max-age=${Math.max(0, Math.floor(seconds))}`;
    return function (_req, res, next) {
        res.setHeader('Cache-Control', value);
        next();
    };
}
