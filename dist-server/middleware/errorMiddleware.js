// 404 handler
export function notFoundHandler(_req, res) {
    res.status(404).json({ message: 'Not Found' });
}
// Central error handler
export function errorHandler(err, _req, res) {
    const status = err?.status || 500;
    const isProd = process.env.NODE_ENV === 'production';
    // Basic logging to console; in prod use proper logger
    if (!isProd) {
        console.error(err);
    }
    const message = status === 500
        ? 'Internal Server Error'
        : typeof err === 'object' && err && 'message' in err
            ? String(err.message)
            : 'Error';
    const payload = { message };
    if (!isProd && err?.stack)
        payload.stack = err.stack;
    res.status(status).json(payload);
}
