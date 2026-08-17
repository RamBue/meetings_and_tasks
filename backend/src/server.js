import express from "express";
// const express = require("express");
import cors from "cors";
import tasksRoutes from "./routes/tasksRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import meetingsRoutes from "./routes/meetingsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// middleware
app.use(
  cors({
    origin: "http://localhost:5173",
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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});
