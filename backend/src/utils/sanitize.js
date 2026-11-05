// Übernimmt nur die erlaubten Felder aus dem Request-Body. So können Clients
// keine internen Felder setzen (z.B. Dateinamen) und keine Update-Operatoren
// wie $set einschleusen.
export function pick(source, allowedFields) {
  const result = {};

  if (!source || typeof source !== "object") return result;

  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(source, field) &&
      source[field] !== undefined
    ) {
      result[field] = source[field];
    }
  }

  return result;
}

// true, wenn der Wert ein Text mit gültiger ObjectId ist (24 Hex-Zeichen).
// Objekte wie { "$ne": null } werden damit abgewiesen.
export function isObjectIdString(value) {
  return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);
}
