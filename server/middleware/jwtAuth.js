import jwt from "jsonwebtoken";

function getTokenFromRequest(req) {
  const raw = req.headers?.authorization;
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase().startsWith("bearer "))
    return trimmed.slice(7).trim();
  return trimmed;
}

function pickUserIdFromRequest(req) {
  const candidates = [req.params?.userId, req.query?.userId];
  for (const v of candidates) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (!s) continue;
    return s;
  }
  return null;
}

export default function jwtAuth(req, res, next) {
  const secret = process.env.SECRET;
  if (!secret) {
    return res
      .status(500)
      .json({ status: false, message: "服务端鉴权配置缺失" });
  }

  const token = getTokenFromRequest(req);
  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "未登录或缺少 token" });
  }

  let payload;
  try {
    payload = jwt.verify(token, secret);
  } catch {
    return res
      .status(401)
      .json({ status: false, message: "token 无效或已过期" });
  }

  const tokenUserId = payload?.userId;
  if (tokenUserId === undefined || tokenUserId === null) {
    return res
      .status(401)
      .json({ status: false, message: "token 缺少 userId" });
  }

  req.user = payload;
  req.userId = tokenUserId;

  const requestUserId = pickUserIdFromRequest(req);
  if (requestUserId && String(tokenUserId) !== requestUserId) {
    return res
      .status(403)
      .json({ status: false, message: "无权限访问该用户资源" });
  }

  next();
}
