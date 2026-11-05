// Datum im Format JJJJ-MM-TT (lokale Zeit), wie es ein <input type="date"> erwartet
export function toLocalDateInput(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}
