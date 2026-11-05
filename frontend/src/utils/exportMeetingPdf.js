import { jsPDF } from "jspdf";
import { CATEGORIES } from "../config/categories";
import { getDecisionsByAgendaItem } from "../services/decisionService";
import { getInformationsByAgendaItem } from "../services/informationService";
import { getTasksByAgendaItem } from "../services/taskService";

// Seitenmasse in mm (A4 hoch)
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const TOP = 15;
const BOTTOM = PAGE_H - 18;
const PT = 0.3528; // 1 pt in mm

// Farben wie auf der Seite: Grün (Logo) nur für Pendenzen, sonst neutrale Grautöne
const WHITE = [255, 255, 255];
const LIGHT = [227, 231, 235]; // graue Karten (Traktanden, fällige Pendenzen)
const BORDER = [173, 181, 189]; // Rahmen der Karten
const TEXT = [33, 37, 41];
const MUTED = [108, 117, 125];
const ACCENT = [167, 201, 71]; // Logo-Grün: Pendenz-Badge, erledigte Pendenz
const ACCENT_TEXT = [16, 21, 37]; // Logo-Dunkelblau: Schrift auf Grün
const SOFT = [222, 226, 230]; // Badges für Entscheid und Information
const SOFT_TEXT = [52, 58, 64];
const NEUTRAL = [108, 117, 125]; // Häkchen "Protokoll genehmigt"
const CHECK_BORDER = [108, 117, 125]; // Rahmen leerer Checkboxen

function hexToRgb(hex) {
  const value = parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("de-CH");
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(date) {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

function names(users) {
  return users && users.length > 0 ? users.map((u) => u.name).join(", ") : "–";
}

function timeRange(from, to) {
  return from || to ? `${from || "–"}–${to || "–"}` : "–";
}

// Lädt Entscheide, Informationen und Pendenzen aller Traktanden
async function loadAgendaContent(agendaItems) {
  return Promise.all(
    agendaItems.map(async (agendaItem) => {
      const [decisions, informations, tasks] = await Promise.all([
        getDecisionsByAgendaItem(agendaItem._id),
        getInformationsByAgendaItem(agendaItem._id),
        getTasksByAgendaItem(agendaItem._id),
      ]);
      return { agendaItem, decisions, informations, tasks };
    }),
  );
}

// Erzeugt aus der Meeting-Detailseite ein PDF (A4 hoch), das wie die Seite aus
// Karten aufgebaut ist, und lädt es herunter.
// mode "invitation": Einladung mit geplantem Ablauf.
// mode "minutes": Protokoll mit effektiven Zeiten, Entscheiden, Informationen und Pendenzen.
export async function exportMeetingPdf({
  meeting,
  tasks,
  agendaItems,
  mode = "invitation",
}) {
  const isMinutes = mode === "minutes";
  const content = isMinutes ? await loadAgendaContent(agendaItems) : [];

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Layout und Zeichnen sind getrennt: Zuerst wird alles vermessen und als Liste
  // von Zeichenbefehlen pro Seite gesammelt. Danach wird gezeichnet, Flächen
  // (kleiner z-Wert) vor dem Inhalt, damit nichts überdeckt wird.
  const ops = [];
  const stack = []; // offene Container (Karten, die Inhalt umschliessen)
  let page = 0;
  let y = TOP;

  const add = (z, fn) => ops.push({ page, z, fn });
  const padSum = () => stack.reduce((sum, c) => sum + c.pad, 0);
  const contentX = () => MARGIN + padSum();
  const contentW = () => PAGE_W - 2 * MARGIN - 2 * padSum();
  const lineHeight = (size) => size * PT * 1.35;

  const wrap = (text, size, bold, width) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    return doc.splitTextToSize(String(text), width);
  };

  const drawBox = (x, top, w, h, fill, radius) => {
    doc.setFillColor(...fill);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, top, w, h, radius, radius, "FD");
  };

  const closeSegment = (c, bottom) => {
    const top = c.segTop;
    add(c.depth, () => drawBox(c.x, top, c.w, bottom - top, c.fill, c.r));
  };

  const beginContainer = ({ fill = WHITE, pad = 4, r = 2 } = {}) => {
    const c = { x: contentX(), w: contentW(), fill, pad, r, depth: stack.length };
    stack.push(c);
    c.segTop = y;
    y += pad;
  };

  const endContainer = () => {
    const c = stack[stack.length - 1];
    y += c.pad;
    closeSegment(c, y);
    stack.pop();
  };

  // Seitenwechsel: offene Container werden auf der alten Seite abgeschlossen
  // und oben auf der neuen Seite fortgesetzt
  const newPage = () => {
    stack.forEach((c) => closeSegment(c, Math.min(y + 2, PAGE_H - 14)));
    page += 1;
    y = TOP;
    stack.forEach((c) => {
      c.segTop = y;
    });
    if (stack.length > 0) y += 3;
  };

  const ensureSpace = (height) => {
    if (y + height > BOTTOM) newPage();
  };

  const textZ = 100;

  const drawLines = (lines, x, top, size, bold, color, strike) => {
    const lh = lineHeight(size);
    lines.forEach((line, i) => {
      const baseline = top + i * lh + (lh - size * PT) / 2 + size * PT * 0.8;
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.text(line, x, baseline);
      if (strike) {
        doc.setDrawColor(...color);
        doc.setLineWidth(0.2);
        const sy = baseline - size * PT * 0.3;
        doc.line(x, sy, x + doc.getTextWidth(line), sy);
      }
    });
  };

  // variant "accent": erledigte Pendenz (grün mit dunklem Häkchen),
  // "neutral": z.B. Protokoll genehmigt (grau mit weissem Häkchen)
  const drawCheckbox = (x, top, checked, variant = "accent") => {
    const fill = variant === "neutral" ? NEUTRAL : ACCENT;
    const tick = variant === "neutral" ? WHITE : ACCENT_TEXT;

    if (checked) {
      doc.setFillColor(...fill);
      doc.setDrawColor(...fill);
    } else {
      doc.setFillColor(...WHITE);
      doc.setDrawColor(...CHECK_BORDER);
    }
    doc.setLineWidth(0.3);
    doc.roundedRect(x, top, 4, 4, 0.7, 0.7, "FD");
    if (checked) {
      doc.setDrawColor(...tick);
      doc.setLineWidth(0.5);
      doc.line(x + 0.9, top + 2.2, x + 1.7, top + 3);
      doc.line(x + 1.7, top + 3, x + 3.2, top + 1.1);
    }
  };

  const drawBadge = (x, top, label, bg, fg) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    const w = doc.getTextWidth(label) + 4;
    doc.setFillColor(...bg);
    doc.roundedRect(x, top, w, 4.6, 1.2, 1.2, "F");
    doc.setTextColor(...fg);
    doc.text(label, x + 2, top + 3.2);
  };

  // Freier Text innerhalb der aktuellen Container (z. B. Abschnittstitel)
  const textLine = (text, { size = 10, bold = false, color = TEXT, gap = 2 } = {}) => {
    const lines = wrap(text, size, bold, contentW());
    const h = lines.length * lineHeight(size);
    ensureSpace(h + gap);
    const x = contentX();
    const top = y;
    add(textZ, () => drawLines(lines, x, top, size, bold, color, false));
    y += h + gap;
  };

  // Weisse Karte mit Badge, Titel, Text usw., optional mit Checkbox links
  const leafCard = (items, { checkbox, fill = WHITE } = {}) => {
    const pad = 3;
    const indent = checkbox === undefined ? 0 : 7;
    const innerW = contentW() - 2 * pad - indent;
    let height = 2 * pad;
    const laid = items.map((item) => {
      if (item.type === "badge") {
        height += 4.6 + 1.2;
        return item;
      }
      if (item.type === "check") {
        height += 5 + 1.2;
        return item;
      }
      const size = item.size || 10;
      const lines = wrap(item.text, size, item.bold, innerW);
      height += lines.length * lineHeight(size) + 1.2;
      return { ...item, size, lines };
    });
    height -= 1.2;

    ensureSpace(height);
    const x = contentX();
    const top = y;
    const w = contentW();

    add(stack.length, () => drawBox(x, top, w, height, fill, 1.5));
    if (checkbox !== undefined) {
      add(textZ, () => drawCheckbox(x + pad, top + pad + 0.5, checkbox));
    }

    let cy = top + pad;
    const tx = x + pad + indent;
    laid.forEach((item) => {
      const itemTop = cy;
      if (item.type === "badge") {
        add(textZ, () => drawBadge(tx, itemTop, item.label, item.bg, item.fg));
        cy += 4.6 + 1.2;
      } else if (item.type === "check") {
        add(textZ, () => {
          drawCheckbox(tx, itemTop, item.checked, "neutral");
          drawLines([item.label], tx + 6, itemTop - 0.2, 10, false, TEXT, false);
        });
        cy += 5 + 1.2;
      } else {
        add(textZ, () =>
          drawLines(
            item.lines,
            tx,
            itemTop,
            item.size,
            item.bold,
            item.color || TEXT,
            item.strike,
          ),
        );
        cy += item.lines.length * lineHeight(item.size) + 1.2;
      }
    });
    y += height + 3;
  };

  const badge = (label, bg, fg = WHITE) => ({ type: "badge", label, bg, fg });
  const text = (value, options = {}) => ({ type: "text", text: value, ...options });

  const taskCard = (task) =>
    leafCard(
      [
        badge("Pendenz", ACCENT, ACCENT_TEXT),
        text(task.title, {
          size: 11,
          bold: true,
          color: task.status === "done" ? MUTED : TEXT,
          strike: task.status === "done",
        }),
        ...(task.description ? [text(task.description)] : []),
        text(
          `Wer: ${task.assignedUser} · Erstellt am: ${formatDate(task.createdAt)} · Fällig am: ${formatDate(task.dueDate)}`,
          { size: 8.5, color: MUTED },
        ),
      ],
      { checkbox: task.status === "done" },
    );

  // ---- Kopfkarte mit Titel und Besetzung ----
  const categoryColor = hexToRgb(
    CATEGORIES.find((c) => c.value === meeting.category)?.color || "#6c757d",
  );
  {
    const w = PAGE_W - 2 * MARGIN;
    const pad = 6;
    const sameDay = formatDate(meeting.startsAt) === formatDate(meeting.endsAt);
    const when = sameDay
      ? `${formatDateTime(meeting.startsAt)} – ${formatTime(meeting.endsAt)}`
      : `${formatDateTime(meeting.startsAt)} – ${formatDateTime(meeting.endsAt)}`;

    const titleLines = wrap(meeting.title, 20, true, w - 2 * pad);
    const headerH =
      pad +
      lineHeight(8) +
      1 +
      titleLines.length * lineHeight(20) +
      1.5 +
      lineHeight(10) +
      lineHeight(10) +
      pad;

    const cells = [
      ["Leitung", meeting.chair?.name || "–"],
      ["Bereichsleitung", names(meeting.businessUnitLeads)],
      ...(isMinutes ? [["Entschuldigt", names(meeting.excusedUsers)]] : []),
      ["Gäste", meeting.guests || "–"],
      ["Protokoll", meeting.minutesBy?.name || "–"],
    ];
    const colW = (w - 2 * pad) / 2;
    const rows = [];
    for (let i = 0; i < cells.length; i += 2) {
      const row = cells.slice(i, i + 2).map(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const labelW = doc.getTextWidth(`${label}: `);
        const lines = wrap(value, 10, false, colW - labelW - 2);
        return { label, labelW, lines };
      });
      rows.push({
        cells: row,
        h: Math.max(...row.map((c) => c.lines.length)) * lineHeight(10) + 2,
      });
    }
    const bodyH =
      pad + lineHeight(14) + 3 + rows.reduce((s, r) => s + r.h, 0) + pad - 2;
    const totalH = headerH + bodyH;
    const x = MARGIN;
    const top = y;

    add(0, () => {
      doc.setFillColor(...WHITE);
      doc.roundedRect(x, top, w, totalH, 2, 2, "F");
      doc.setFillColor(...categoryColor);
      doc.roundedRect(x, top, w, headerH, 2, 2, "F");
      doc.rect(x, top + headerH - 3, w, 3, "F");
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, top, w, totalH, 2, 2, "S");
    });
    add(textZ, () => {
      let cy = top + pad;
      drawLines([isMinutes ? "PROTOKOLL" : "EINLADUNG"], x + pad, cy, 8, true, WHITE);
      cy += lineHeight(8) + 1;
      drawLines(titleLines, x + pad, cy, 20, true, WHITE);
      cy += titleLines.length * lineHeight(20) + 1.5;
      drawLines([when], x + pad, cy, 10, false, WHITE);
      cy += lineHeight(10);
      drawLines([meeting.location || "Kein Ort erfasst"], x + pad, cy, 10, false, WHITE);

      cy = top + headerH + pad;
      drawLines(["Besetzung"], x + pad, cy, 14, true, TEXT);
      cy += lineHeight(14) + 3;
      rows.forEach((row) => {
        row.cells.forEach((cell, col) => {
          const cx = x + pad + col * colW;
          drawLines([`${cell.label}:`], cx, cy, 10, true, TEXT);
          drawLines(cell.lines, cx + cell.labelW, cy, 10, false, TEXT);
        });
        cy += row.h;
      });
    });
    y += totalH + 5;
  }

  // ---- Protokoll (nur im Protokoll) ----
  if (isMinutes) {
    ensureSpace(45);
    beginContainer({ pad: 5 });
    textLine("Protokoll", { size: 14, bold: true, gap: 3 });
    textLine(`Dokument: ${meeting.protocolOriginalName || "–"}`, { gap: 3 });
    leafCard(
      [
        { type: "check", label: "Protokoll genehmigt", checked: !!meeting.protocolApproved },
        text("Korrekturen / Präzisierungen:", { bold: true }),
        text(meeting.protocolCorrections || "–"),
      ],
      { fill: WHITE },
    );
    y -= 3;
    endContainer();
    y += 5;
  }

  // ---- Pendenzen aus vorherigen Meetings ----
  ensureSpace(45);
  beginContainer({ pad: 5 });
  textLine("Pendenzen", { size: 14, bold: true, gap: 3 });
  ensureSpace(35);
  beginContainer({ fill: LIGHT, pad: 4 });
  textLine("Fällige Pendenzen aus vorherigen Meetings", {
    size: 8.5,
    color: MUTED,
    gap: 3,
  });
  if (tasks.length === 0) {
    textLine("Keine Pendenzen", { color: MUTED, gap: 0 });
  } else {
    tasks.forEach(taskCard);
    y -= 3;
  }
  endContainer();
  endContainer();
  y += 5;

  // ---- Traktanden ----
  ensureSpace(45);
  beginContainer({ pad: 5 });
  textLine("Traktanden", { size: 14, bold: true, gap: 3 });
  if (agendaItems.length === 0) {
    textLine("Keine Traktanden erfasst", { color: MUTED, gap: 0 });
  }

  const agendaMeta = (item) =>
    `Verantwortlich: ${item.responsibleUser?.name || "–"} · Geplant: ${timeRange(item.plannedFrom, item.plannedTo)}${
      isMinutes ? ` · Effektiv: ${timeRange(item.actualFrom, item.actualTo)}` : ""
    }`;

  if (isMinutes) {
    content.forEach(({ agendaItem, decisions, informations, tasks: items }) => {
      ensureSpace(40);
      beginContainer({ fill: LIGHT, pad: 4 });
      textLine(agendaItem.title, { size: 12, bold: true, gap: 1 });
      textLine(agendaMeta(agendaItem), { size: 8.5, color: MUTED, gap: 3 });

      decisions.forEach((decision) =>
        leafCard([
          badge("Entscheid", SOFT, SOFT_TEXT),
          text(`Nr. ${decision.number}: ${decision.topic}`, { size: 11, bold: true }),
          ...(decision.description ? [text(decision.description)] : []),
        ]),
      );
      informations.forEach((information) =>
        leafCard([
          badge("Information", SOFT, SOFT_TEXT),
          text(information.topic, { size: 11, bold: true }),
          ...(information.description ? [text(information.description)] : []),
        ]),
      );
      items.forEach(taskCard);
      y -= 3;
      endContainer();
      y += 3;
    });
  } else {
    agendaItems.forEach((item) => {
      ensureSpace(25);
      beginContainer({ fill: LIGHT, pad: 4 });
      textLine(item.title, { size: 12, bold: true, gap: 1 });
      textLine(agendaMeta(item), { size: 8.5, color: MUTED, gap: 0 });
      endContainer();
      y += 3;
    });
  }
  endContainer();

  // ---- Zeichnen ----
  for (let p = 1; p <= page; p++) doc.addPage();
  const pageCount = page + 1;
  for (let p = 0; p < pageCount; p++) {
    doc.setPage(p + 1);
    ops
      .filter((op) => op.page === p)
      .sort((a, b) => a.z - b.z)
      .forEach((op) => op.fn());

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Seite ${p + 1} von ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 8, {
      align: "right",
    });
  }

  const safeTitle = meeting.title.replace(/[^\p{L}\p{N}]+/gu, "_");
  doc.save(
    `${isMinutes ? "Protokoll" : "Einladung"}_${safeTitle}_${new Date(meeting.startsAt).toISOString().slice(0, 10)}.pdf`,
  );
}
