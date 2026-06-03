import { createHash } from 'crypto';

function createEtag(payload) {
    return `"${createHash('sha1').update(payload).digest('base64url')}"`;
}

export function applyPrivateCache(seconds) {
    return function cacheMiddleware(req, res, next) {
        const originalJson = res.json.bind(res);
        res.set('Cache-Control', `private, max-age=${seconds}`);
        res.set('Expires', new Date(Date.now() + seconds * 1000).toUTCString());
        res.set('Vary', 'Authorization');

        res.json = function jsonWithCache(body) {
            const payload = JSON.stringify(body ?? null);
            const etag = createEtag(payload);
            const requestEtag = req.headers['if-none-match'];

            res.set('ETag', etag);
            if (requestEtag === etag) {
                return res.status(304).end();
            }

            return originalJson(body);
        };

        next();
    };
}
