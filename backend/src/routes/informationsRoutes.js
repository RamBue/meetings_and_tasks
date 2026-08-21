import express from "express";
import {
  getAllInformations,
  getInformationById,
  createInformation,
  updateInformation,
  deleteInformation,
} from "../controllers/informationsController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

router.get("/", getAllInformations);
router.get("/:id", validateObjectId, getInformationById);
router.post("/", createInformation);
router.put("/:id", validateObjectId, updateInformation);
router.delete("/:id", validateObjectId, deleteInformation);

export default router;
