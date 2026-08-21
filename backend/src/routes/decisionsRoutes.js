import express from "express";
import {
  getAllDecisions,
  getDecisionById,
  createDecision,
  updateDecision,
  deleteDecision,
} from "../controllers/decisionsController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

router.get("/", getAllDecisions);
router.get("/:id", validateObjectId, getDecisionById);
router.post("/", createDecision);
router.put("/:id", validateObjectId, updateDecision);
router.delete("/:id", validateObjectId, deleteDecision);

export default router;
