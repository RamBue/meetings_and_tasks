import express from "express";
// const express = require("express");
import { createServer } from "http";
import cors from "cors";
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

// middleware
app.use(
  cors({
    origin: allowedOrigins,
  }),
);

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
