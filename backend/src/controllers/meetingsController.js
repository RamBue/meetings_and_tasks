import fs from "fs";
import path from "path";
import Task from "../models/task.js";
import Meeting from "../models/meeting.js";
import AgendaItem from "../models/agendaItem.js";
import { protocolsDir } from "../middleware/upload.js";

// GET all meetings
export async function getMeetings(req, res) {
  try {
    const meetings = await Meeting.find().sort({
      startsAt: 1,
    });

    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error in getMeetings controller", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET single meeting
export async function getMeetingById(req, res) {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate("chair", "name")
      .populate("businessUnitLeads", "name")
      .populate("excusedUsers", "name")
      .populate("minutesBy", "name");

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    // Pendenzen werden rein über ihr Fälligkeitsdatum dem Meeting-Tag zugeordnet,
    // damit eine verschobene Pendenz beim alten Meeting verschwindet und beim neuen erscheint
    const meetingDay = new Date(meeting.startsAt);
    const dayStart = new Date(
      meetingDay.getFullYear(),
      meetingDay.getMonth(),
      meetingDay.getDate(),
    );
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Nur Pendenzen ohne Traktandum-Bezug gehören in diesen Block –
    // neue Pendenzen werden direkt beim jeweiligen Traktandum erfasst
    const tasks = await Task.find({
      dueDate: { $gte: dayStart, $lt: dayEnd },
      agendaItemId: null,
    }).sort({ dueDate: 1 });

    const agendaItems = await AgendaItem.find({ meetingId: meeting._id })
      .populate("responsibleUser", "name")
      .sort({ createdAt: 1 });

    res.status(200).json({ meeting, tasks, agendaItems });
  } catch (error) {
    console.error("Error in getMeetingById controller", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// CREATE meeting
export async function createMeeting(req, res) {
  try {
    const meeting = req.body;

    const newMeeting = new Meeting(meeting);

    const savedMeeting = await newMeeting.save();

    res.status(201).json(savedMeeting);
  } catch (error) { console.error("Error in createMeeting controller", error); 
    // Mongoose Validation Error 
    if (error.name === "ValidationError") { return res.status(400).json({ message: error.message, }); } 
    // Fallback 
    res.status(500).json({ message: "Internal server error", }); }
}

// UPDATE meeting
export async function updateMeeting(req, res) {
  try {
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );

    if (!updatedMeeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.status(200).json(updatedMeeting);
  } catch (error) { console.error("Error in updateMeeting controller", error); 
    // Mongoose Validation Error 
    if (error.name === "ValidationError") { return res.status(400).json({ message: error.message, }); } 
    // Fallback 
    res.status(500).json({ message: "Internal server error", }); }
}

// UPLOAD meeting protocol PDF
export async function uploadMeetingProtocol(req, res) {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Es wurde keine PDF-Datei übermittelt",
      });
    }

    if (meeting.protocolFileName) {
      const oldPath = path.join(protocolsDir, meeting.protocolFileName);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    meeting.protocolFileName = req.file.filename;
    meeting.protocolOriginalName = req.file.originalname;
    meeting.protocolUploadedAt = new Date();
    meeting.protocolApproved = false;
    meeting.protocolCorrections = "";

    await meeting.save();

    res.status(200).json(meeting);
  } catch (error) {
    console.error("Error in uploadMeetingProtocol controller", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// DOWNLOAD meeting protocol PDF
export async function downloadMeetingProtocol(req, res) {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting || !meeting.protocolFileName) {
      return res.status(404).json({
        message: "Für dieses Meeting wurde noch kein Protokoll hochgeladen",
      });
    }

    res.download(
      path.join(protocolsDir, meeting.protocolFileName),
      meeting.protocolOriginalName || "protokoll.pdf",
    );
  } catch (error) {
    console.error("Error in downloadMeetingProtocol controller", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// DELETE meeting
export async function deleteMeeting(req, res) {
  try {
    const deletedMeeting = await Meeting.findByIdAndDelete(req.params.id);

    if (!deletedMeeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    if (deletedMeeting.protocolFileName) {
      const filePath = path.join(protocolsDir, deletedMeeting.protocolFileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(200).json({
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteMeeting controller", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
