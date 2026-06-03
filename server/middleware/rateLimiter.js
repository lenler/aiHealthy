const store = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.start > WINDOW_MS) store.delete(key);
  }
}, 60 * 1000);

export default function rateLimiter(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.start > WINDOW_MS) {
    store.set(key, { start: now, count: 1 });
    return next();
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({
      status: false,
      message: '请求过于频繁，请稍后重试'
    });
  }
  next();
}
