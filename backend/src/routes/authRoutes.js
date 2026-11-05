import express from "express";
import rateLimit from "express-rate-limit";
import { login, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Schutz vor Durchprobieren von Passwörtern: erfolgreiche Anmeldungen zählen nicht
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts" },
});

router.post("/login", loginLimiter, login);
router.get("/me", requireAuth, me);

export default router;
