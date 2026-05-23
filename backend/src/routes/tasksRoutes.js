import express from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/tasksController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

router.get("/", getAllTasks);
router.get("/:id", validateObjectId, getTaskById);
router.post("/", createTask);
router.put("/:id", validateObjectId, updateTask);
router.delete("/:id", validateObjectId, deleteTask);

export default router;
