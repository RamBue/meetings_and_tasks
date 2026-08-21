import express from "express";
import {
  getAllAgendaItems,
  getAgendaItemById,
  createAgendaItem,
  updateAgendaItem,
  deleteAgendaItem,
} from "../controllers/agendaItemsController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

router.get("/", getAllAgendaItems);
router.get("/:id", validateObjectId, getAgendaItemById);
router.post("/", createAgendaItem);
router.put("/:id", validateObjectId, updateAgendaItem);
router.delete("/:id", validateObjectId, deleteAgendaItem);

export default router;
