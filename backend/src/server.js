import express from "express";
// const express = require("express");
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initSocket } from "./config/socket.js";
import tasksRoutes from "./routes/tasksRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import meetingsRoutes from "./routes/meetingsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import decisionsRoutes from "./routes/decisionsRoutes.js";
import informationsRoutes from "./routes/informationsRoutes.js";
import agendaItemsRoutes from "./routes/agendaItemsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5173"
).split(",");

// Hinter dem Proxy von Render kommt die echte Adresse des Besuchers im
// Header X-Forwarded-For an (wird für die Anfragebegrenzung gebraucht)
app.set("trust proxy", 1);

// Query-Parameter als einfache Texte lesen: "?name[$ne]=x" wird so nicht mehr
// zu einem Objekt mit MongoDB-Operator
app.set("query parser", "simple");

// middleware
// Sicherheits-Header (u.a. kein "x-powered-by"). Die API wird vom Frontend auf
// einer anderen Adresse aufgerufen, daher "cross-origin" für die Ressourcen.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin: allowedOrigins,
  }),
);

// Anfragebegrenzung pro Besucher: normale Nutzung bleibt weit darunter
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests" },
  }),
);

// Protokoll-Upload zusätzlich begrenzen
app.post(
  "/api/meetings/:id/protocol",
  rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many uploads" },
  }),
);

// Query-Parameter müssen einfache Texte sein (keine Listen durch doppelte Namen)
app.use((req, res, next) => {
  for (const value of Object.values(req.query)) {
    if (typeof value !== "string") {
      return res.status(400).json({ message: "Invalid query parameter" });
    }
  }
  next();
});

app.use(express.json());
// our simple custom middleware
// app.use((req, res, next) => {
//   console.log(`Req method is ${req.method} & Req URL is ${req.url}`);
//   next();
// });

app.use("/api/tasks", tasksRoutes);
app.use("/api/meetings", meetingsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/decisions", decisionsRoutes);
app.use("/api/informations", informationsRoutes);
app.use("/api/agenda-items", agendaItemsRoutes);

const httpServer = createServer(app);
initSocket(httpServer, allowedOrigins);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});
