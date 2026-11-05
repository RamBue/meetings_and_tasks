// Erzeugt den Wert für die Umgebungsvariable AUTH_PASSWORD_HASH.
// Aufruf im Ordner backend:  npm run hash-password
// Das Passwort wird abgefragt (für jedes Zeichen erscheint ein "*") und nicht gespeichert.
import { hashPassword } from "../src/utils/password.js";
import { askPassword } from "./ask-password.js";

const MIN_LENGTH = 12;

const password = await askPassword("Neues Passwort (wird als * angezeigt): ");

if (password.length < MIN_LENGTH) {
  console.error(`Das Passwort muss mindestens ${MIN_LENGTH} Zeichen lang sein.`);
  process.exit(1);
}

if (process.stdin.isTTY) {
  const repeat = await askPassword("Passwort wiederholen: ");
  if (repeat !== password) {
    console.error("Die Passwörter stimmen nicht überein.");
    process.exit(1);
  }
}

console.log("\nIn die Umgebungsvariablen eintragen (Render und lokale .env):\n");
console.log(`AUTH_PASSWORD_HASH=${await hashPassword(password)}`);
