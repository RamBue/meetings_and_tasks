import express from "express";
// const express = require("express");
import tasksRoutes from "./routes/tasksRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import meetingsRoutes from "./routes/meetingsRoutes.js";

dotenv.config();

console.log(process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5002;

// middleware
app.use(express.json()); // this middleware will parse JSON bodies: req.body
app.use(rateLimiter);
// our simple custom middleware
// app.use((req, res, next) => {
//   console.log(`Req method is ${req.method} & Req URL is ${req.url}`);
//   next();
// });

app.use("/api/tasks", tasksRoutes);
app.use("/api/meetings", meetingsRoutes);


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});
