import express from "express";

import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  uploadMeetingProtocol,
  downloadMeetingProtocol,
} from "../controllers/meetingsController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { uploadProtocolPdf } from "../middleware/upload.js";


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

// UPLOAD meeting protocol PDF
router.post(
  "/:id/protocol",
  validateObjectId,
  (req, res, next) => {
    uploadProtocolPdf.single("pdf")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  uploadMeetingProtocol,
);

// DOWNLOAD meeting protocol PDF
router.get(
  "/:id/protocol/download",
  validateObjectId,
  downloadMeetingProtocol,
);

export default router;
