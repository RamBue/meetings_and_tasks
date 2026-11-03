import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS_LABELS = {
  open: "Offen",
  in_progress: "In Arbeit",
  done: "Erledigt",
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("de-CH");
}

// Erzeugt aus den übergebenen Pendenzen eine PDF-Liste (A4 quer) und lädt sie herunter.
// filterText beschreibt die aktuelle Auswahl und wird unter dem Titel ausgegeben.
export function exportTasksPdf(tasks, filterText = "") {
  const doc = new jsPDF({ orientation: "landscape", format: "a4" });
  const today = new Date().toLocaleDateString("de-CH");

  doc.setFontSize(18);
  doc.text("Pendenzenliste", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Stand: ${today}${filterText ? ` · ${filterText}` : ""}`, 14, 25);
  doc.text(`${tasks.length} Pendenzen`, 14, 30);

  autoTable(doc, {
    startY: 35,
    head: [
      [
        "#",
        "Kategorie",
        "Titel",
        "Beschreibung",
        "Verantwortlich",
        "Fällig am",
        "Status",
      ],
    ],
    body: tasks.map((task, index) => [
      index + 1,
      task.category || "",
      task.title || "",
      task.description || "",
      task.assignedUser || "",
      formatDate(task.dueDate),
      STATUS_LABELS[task.status] || task.status,
    ]),
    styles: { fontSize: 9, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [33, 37, 41] },
    columnStyles: {
      0: { cellWidth: 10 },
      3: { cellWidth: 90 },
    },
    didDrawPage: () => {
      const pageSize = doc.internal.pageSize;
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `Seite ${doc.internal.getCurrentPageInfo().pageNumber}`,
        pageSize.getWidth() - 14,
        pageSize.getHeight() - 8,
        { align: "right" },
      );
    },
  });

  doc.save(`Pendenzenliste_${new Date().toISOString().slice(0, 10)}.pdf`);
}
