import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);

const KEY_LENGTH = 64;

// Erzeugt den Hash für die Umgebungsvariable AUTH_PASSWORD_HASH.
// Format: scrypt:<Salt hex>:<Hash hex>. Bewusst ohne "$", damit .env-Dateien
// und Docker Compose den Wert nicht als Variable deuten.
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH);

  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

// Prüft ein Passwort gegen den gespeicherten Hash (zeitkonstanter Vergleich)
export async function verifyPassword(password, stored) {
  try {
    const [scheme, saltHex, hashHex] = String(stored).split(":");
    if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

    const expected = Buffer.from(hashHex, "hex");
    if (expected.length < 16) return false;

    const actual = await scrypt(
      password,
      Buffer.from(saltHex, "hex"),
      expected.length,
    );

    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
