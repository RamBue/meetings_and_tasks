import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const protocolsDir = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "protocols",
);
fs.mkdirSync(protocolsDir, { recursive: true });

const protocolStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, protocolsDir),
  filename: (req, file, cb) => {
    cb(null, `meeting-${req.params.id}-${Date.now()}.pdf`);
  },
});

export const uploadProtocolPdf = multer({
  storage: protocolStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Nur PDF-Dateien sind erlaubt"));
    }
    cb(null, true);
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});
