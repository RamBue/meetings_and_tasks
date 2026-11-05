import { verifyToken } from "../utils/token.js";

// Lässt nur Anfragen mit gültigem Token durch ("Authorization: Bearer <Token>")
export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  const payload = scheme === "Bearer" ? verifyToken(token) : null;

  if (!payload) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.auth = payload;
  next();
}
