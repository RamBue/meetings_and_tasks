import fs from "fs";
import Task from "../models/task.js";
import Meeting from "../models/meeting.js";
import AgendaItem from "../models/agendaItem.js";
import Decision from "../models/decision.js";
import Information from "../models/information.js";
import { protocolFilePath } from "../middleware/upload.js";
import { notifyChange } from "../config/socket.js";
import { pick } from "../utils/sanitize.js";

// Felder, die ein Client setzen darf. Die Angaben zur hochgeladenen Datei
// (protocolFileName, protocolOriginalName, protocolUploadedAt) setzt nur der Server.
const MEETING_CREATE_FIELDS = [
  "title",
  "category",
  "description",
  "location",
  "startsAt",
  "endsAt",
  "chair",
  "businessUnitLeads",
  "excusedUsers",
  "guests",
  "minutesBy",
];

const MEETING_UPDATE_FIELDS = [
  ...MEETING_CREATE_FIELDS,
  "protocolApproved",
  "protocolCorrections",
];

// Prüft anhand der ersten Bytes, ob die Datei wirklich ein PDF ist
function isPdfFile(filePath) {
  const fd = fs.openSync(filePath, "r");
  try {
    const header = Buffer.alloc(5);
    fs.readSync(fd, header, 0, 5, 0);
    return header.toString("latin1") === "%PDF-";
  } finally {
    fs.closeSync(fd);
  }
}

// Löscht eine Protokoll-Datei, falls sie existiert
function removeProtocolFile(fileName) {
  const filePath = protocolFilePath(fileName);
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

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
    const meeting = pick(req.body, MEETING_CREATE_FIELDS);

    const newMeeting = new Meeting(meeting);

    const savedMeeting = await newMeeting.save();

    notifyChange("meeting", "created", savedMeeting._id);
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
    const updates = pick(req.body, MEETING_UPDATE_FIELDS);

    // Beim Verschieben muss das Ende nach dem Beginn liegen (die Validierung
    // im Schema greift bei Updates nicht)
    if (updates.startsAt || updates.endsAt) {
      const existing = await Meeting.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({
          message: "Meeting not found",
        });
      }

      const startsAt = new Date(updates.startsAt || existing.startsAt);
      const endsAt = new Date(updates.endsAt || existing.endsAt);

      if (isNaN(startsAt) || isNaN(endsAt) || endsAt <= startsAt) {
        return res.status(400).json({
          message: "End date must be after start date",
        });
      }
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
      },
    );

    if (!updatedMeeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    notifyChange("meeting", "updated", updatedMeeting._id);
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

    // Der Inhalt muss ein PDF sein, die vom Client gemeldete Dateiart genügt nicht
    if (!isPdfFile(req.file.path)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "Nur PDF-Dateien sind erlaubt",
      });
    }

    removeProtocolFile(meeting.protocolFileName);

    meeting.protocolFileName = req.file.filename;
    meeting.protocolOriginalName = req.file.originalname;
    meeting.protocolUploadedAt = new Date();
    meeting.protocolApproved = false;
    meeting.protocolCorrections = "";

    await meeting.save();

    notifyChange("meeting", "updated", meeting._id);
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

    const filePath = meeting && protocolFilePath(meeting.protocolFileName);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Für dieses Meeting wurde noch kein Protokoll hochgeladen",
      });
    }

    res.download(filePath, meeting.protocolOriginalName || "protokoll.pdf");
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

    removeProtocolFile(deletedMeeting.protocolFileName);

    // Traktanden, Entscheide und Informationen gehören fest zum Meeting und
    // werden mitgelöscht. Pendenzen bleiben bestehen und werden nur vom
    // Meeting gelöst (sie erscheinen danach wieder über ihr Fälligkeitsdatum).
    const agendaItemIds = (
      await AgendaItem.find({ meetingId: deletedMeeting._id }, "_id")
    ).map((item) => item._id);

    await Decision.deleteMany({ meetingId: deletedMeeting._id });
    await Information.deleteMany({ meetingId: deletedMeeting._id });
    await AgendaItem.deleteMany({ meetingId: deletedMeeting._id });
    await Task.updateMany(
      {
        $or: [
          { meetingId: deletedMeeting._id },
          { agendaItemId: { $in: agendaItemIds } },
        ],
      },
      { $unset: { meetingId: "", agendaItemId: "" } },
    );

    notifyChange("meeting", "deleted", deletedMeeting._id);
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
