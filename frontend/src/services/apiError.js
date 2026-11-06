// Übersetzt Fehler des Backends in verständliche Meldungen auf Deutsch.

const FIELD_LABELS = {
  title: "Titel",
  category: "Kategorie",
  description: "Beschreibung",
  assignedUser: "Verantwortlich",
  responsibleUser: "Verantwortlich",
  dueDate: "Fällig am",
  status: "Status",
  startsAt: "Beginn",
  endsAt: "Ende",
  location: "Ort",
  chair: "Leitung",
  businessUnitLeads: "Bereichsleitung",
  excusedUsers: "Entschuldigt",
  minutesBy: "Protokoll",
  guests: "Gäste",
  protocolCorrections: "Korrekturen",
  topic: "Thema",
  plannedFrom: "Geplant von",
  plannedTo: "Geplant bis",
  actualFrom: "Effektiv von",
  actualTo: "Effektiv bis",
  name: "Name",
  email: "E-Mail",
};

const CODE_TEXT = {
  required: () => "ist erforderlich",
  too_short: ({ min }) =>
    min ? `ist zu kurz (mindestens ${min} Zeichen)` : "ist zu kurz",
  too_long: ({ max }) =>
    max ? `ist zu lang (höchstens ${max} Zeichen)` : "ist zu lang",
  invalid_format: () => "hat ein ungültiges Format",
  invalid: () => "hat einen ungültigen Wert",
};

// Meldungen für besondere Fälle, die das Backend mit "code" kennzeichnet
const CODE_MESSAGES = {
  not_pdf: "Es sind nur PDF-Dateien erlaubt.",
  file_too_large: "Die Datei ist zu gross (höchstens 20 MB).",
  no_file: "Bitte wählen Sie eine PDF-Datei aus.",
};

function describeStatus(status) {
  if (status === 400) return "Die Angaben sind ungültig.";
  if (status === 401) return "Bitte melden Sie sich erneut an.";
  if (status === 403) return "Dafür fehlt die Berechtigung.";
  if (status === 404) {
    return "Der Eintrag wurde nicht gefunden. Vielleicht wurde er inzwischen gelöscht.";
  }
  if (status === 409) return "Der Eintrag wurde inzwischen geändert.";
  if (status === 413) return "Die Eingabe ist zu gross.";
  if (status === 429) return "Zu viele Anfragen. Bitte warten Sie einen Moment.";
  if (status >= 500) {
    return "Der Server hat ein Problem. Bitte versuchen Sie es später erneut.";
  }
  return null;
}

function describeField({ field, code, ...details }) {
  const label = FIELD_LABELS[field] || "Eine Angabe";
  const text = (CODE_TEXT[code] || CODE_TEXT.invalid)(details);

  return `${label} ${text}`;
}

// Fehler eines Aufrufs. Die Meldung nennt, was nicht geklappt hat, und wenn
// bekannt auch den Grund (reason).
export class ApiError extends Error {
  constructor(fallback, reason, status) {
    super(reason ? (fallback ? `${fallback}: ${reason}` : reason) : fallback);
    this.name = "ApiError";
    this.reason = reason || null;
    this.status = status;
  }
}

// Der Server war nicht erreichbar (Netzwerk, Server schläft, Zeitüberschreitung)
export function networkError() {
  return new ApiError(
    "",
    "Der Server ist nicht erreichbar. Nach längerer Pause braucht er bis zu 30 Sekunden zum Aufwachen. Bitte prüfen Sie die Verbindung und versuchen Sie es erneut.",
  );
}

// Baut aus einer Fehlerantwort des Backends einen ApiError.
// fallback ist die Meldung, was nicht geklappt hat, z.B. "Pendenz konnte nicht gespeichert werden".
export async function apiError(response, fallback) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    // Antwort ohne lesbaren Inhalt: es zählt nur der Status
  }

  let reason;

  if (data?.code && CODE_MESSAGES[data.code]) {
    reason = CODE_MESSAGES[data.code];
  } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
    reason = `${data.errors.map(describeField).join(", ")}.`;
  } else {
    reason = describeStatus(response.status);
  }

  return new ApiError(fallback, reason, response.status);
}

// Meldung für die Anzeige: Grund anhängen, falls der Fehler einen kennt
export function errorMessage(error, fallback) {
  return error?.reason ? `${fallback}: ${error.reason}` : fallback;
}
