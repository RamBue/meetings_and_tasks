import crypto from "crypto";
import jwt from "jsonwebtoken";
import { verifyPassword } from "../utils/password.js";
import { isAuthConfigured, signToken } from "../utils/token.js";

const MAX_INPUT_LENGTH = 200;

// Vergleicht zwei Texte in gleicher Zeit, unabhängig davon, wo sie sich unterscheiden
function safeEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();

  return crypto.timingSafeEqual(hashA, hashB);
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    if (!isAuthConfigured()) {
      console.error(
        "Login ist nicht konfiguriert: AUTH_USER, AUTH_PASSWORD_HASH und JWT_SECRET (mindestens 32 Zeichen) setzen",
      );
      return res.status(503).json({ message: "Login is not configured" });
    }

    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username.length > MAX_INPUT_LENGTH ||
      password.length > MAX_INPUT_LENGTH
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Beides wird immer geprüft, damit die Antwortzeit nicht verrät,
    // ob der Benutzername stimmt
    const userOk = safeEqual(username, process.env.AUTH_USER);
    const passwordOk = await verifyPassword(
      password,
      process.env.AUTH_PASSWORD_HASH,
    );

    if (!userOk || !passwordOk) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(process.env.AUTH_USER);
    const { exp } = jwt.decode(token);

    res.status(200).json({
      token,
      username: process.env.AUTH_USER,
      expiresAt: exp * 1000,
    });
  } catch (error) {
    console.error("Error in login controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/auth/me (nur mit gültigem Token erreichbar)
export function me(req, res) {
  res.status(200).json({
    username: req.auth.sub,
    expiresAt: req.auth.exp * 1000,
  });
}
