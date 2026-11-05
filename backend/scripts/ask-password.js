import readline from "readline";

// Fragt ein Passwort ab. Im Terminal erscheint für jedes eingegebene Zeichen ein
// "*", das Passwort selbst bleibt unsichtbar. Backspace löscht das letzte Zeichen.
// Ohne Terminal (z.B. bei umgeleiteter Eingabe) wird eine Zeile gelesen.
export function askPassword(question) {
  const stdin = process.stdin;

  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    return new Promise((resolve) => {
      const rl = readline.createInterface({ input: stdin, output: process.stdout });
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  return new Promise((resolve) => {
    let value = "";

    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const finish = () => {
      stdin.removeListener("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write("\n");
      resolve(value);
    };

    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") return finish();

        if (ch === "\u0003") {
          // Strg+C
          stdin.setRawMode(false);
          process.stdout.write("\n");
          process.exit(130);
        }

        // Pfeiltasten und andere Steuersequenzen ignorieren
        if (ch === "\u001b") break;

        if (ch === "\u007f" || ch === "\b") {
          if (value.length > 0) {
            value = [...value].slice(0, -1).join("");
            process.stdout.write("\b \b");
          }
          continue;
        }

        if (ch >= " ") {
          value += ch;
          process.stdout.write("*");
        }
      }
    };

    stdin.on("data", onData);
  });
}
