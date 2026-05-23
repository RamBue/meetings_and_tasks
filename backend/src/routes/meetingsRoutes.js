import express from "express";

import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../controllers/meetingsController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";


const router = express.Router();

// GET all meetings
router.get("/", getMeetings);

// GET single meeting
router.get("/:id", validateObjectId, getMeetingById);

// CREATE meeting
router.post("/", createMeeting);

// UPDATE meeting
router.put("/:id", validateObjectId, updateMeeting);

// DELETE meeting
router.delete("/:id", validateObjectId, deleteMeeting);

export default router;
