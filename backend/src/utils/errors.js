// Übersetzt die Art eines Mongoose-Prüffehlers in einen kurzen Code für den Client
const VALIDATION_CODES = {
  required: "required",
  minlength: "too_short",
  maxlength: "too_long",
  enum: "invalid",
  ObjectId: "invalid_format",
  date: "invalid_format",
  Number: "invalid_format",
  Boolean: "invalid_format",
  string: "invalid_format",
};

// Liste der fehlerhaften Felder, ohne interne Texte oder Modellnamen
function describeValidationError(error) {
  return Object.values(error.errors).map((entry) => {
    const detail = {
      field: entry.path,
      code: VALIDATION_CODES[entry.kind] || "invalid",
    };

    if (entry.kind === "minlength") detail.min = entry.properties?.minlength;
    if (entry.kind === "maxlength") detail.max = entry.properties?.maxlength;

    return detail;
  });
}

// Beantwortet einen Fehler aus einem Controller. Der Client erfährt, was er
// falsch gemacht hat, aber nichts über den Aufbau von Server und Datenbank.
export function handleError(res, error) {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: describeValidationError(error),
    });
  }

  // Ungültiger Wert, z.B. eine Text statt einer ID
  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid value",
      errors: [{ field: error.path, code: "invalid_format" }],
    });
  }

  // Eintrag existiert bereits (eindeutiges Feld)
  if (error.code === 11000) {
    return res.status(409).json({ message: "Already exists" });
  }

  res.status(500).json({ message: "Internal server error" });
}

// Zentrale Fehlerbehandlung von Express für alles, was nicht in einem
// Controller abgefangen wird, z.B. ungültiges JSON oder zu grosse Anfragen.
// Ohne diese Funktion antwortet Express mit einer Seite samt Stacktrace.
// eslint-disable-next-line no-unused-vars
export function errorMiddleware(error, req, res, next) {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON" });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request too large" });
  }

  // Übrige Fehler des Anfrage-Parsers (z.B. falsche Zeichenkodierung)
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ message: "Invalid request" });
  }

  console.error("Unhandled error", error);
  res.status(500).json({ message: "Internal server error" });
}
