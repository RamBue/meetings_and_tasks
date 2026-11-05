import jwt from "jsonwebtoken";

const MIN_SECRET_LENGTH = 32;

// Die Umgebungsvariablen werden erst bei Gebrauch gelesen, denn dotenv wird in
// server.js erst nach dem Laden der Module ausgeführt.

// true, wenn Benutzer, Passwort-Hash und ein ausreichend langes Geheimnis gesetzt sind
export function isAuthConfigured() {
  const { AUTH_USER, AUTH_PASSWORD_HASH, JWT_SECRET } = process.env;

  return Boolean(
    AUTH_USER &&
      AUTH_PASSWORD_HASH &&
      JWT_SECRET &&
      JWT_SECRET.length >= MIN_SECRET_LENGTH,
  );
}

// Stellt ein Token aus. Es gibt keinen Zustand auf dem Server, deshalb können
// beliebig viele Clients gleichzeitig mit denselben Zugangsdaten angemeldet sein.
export function signToken(username) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    algorithm: "HS256",
    subject: username,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Liefert den Inhalt des Tokens oder null, wenn es ungültig oder abgelaufen ist
export function verifyToken(token) {
  if (!isAuthConfigured() || typeof token !== "string" || !token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // Wird der Benutzer in der Konfiguration geändert, verlieren alte Tokens ihre Gültigkeit
    return payload.sub === process.env.AUTH_USER ? payload : null;
  } catch {
    return null;
  }
}
