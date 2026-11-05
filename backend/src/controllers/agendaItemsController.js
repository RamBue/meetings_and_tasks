import AgendaItem from "../models/agendaItem.js";
import Meeting from "../models/meeting.js";
import Decision from "../models/decision.js";
import Information from "../models/information.js";
import Task from "../models/task.js";
import { notifyChange } from "../config/socket.js";

// Ein Traktandum darf nur verschoben oder gelöscht werden, solange es noch keinen
// Entscheid, keine Information und keine Pendenz enthält. Sobald etwas erfasst
// ist, hat das Meeting stattgefunden bzw. wird protokolliert.
async function hasContent(agendaItemId) {
  const [decisions, informations, tasks] = await Promise.all([
    Decision.exists({ agendaItemId }),
    Information.exists({ agendaItemId }),
    Task.exists({ agendaItemId }),
  ]);
  return Boolean(decisions || informations || tasks);
}

// GET all agenda items
export async function getAllAgendaItems(req, res) {
  try {
    const { meetingId } = req.query;

    const filter = {};
    if (meetingId) {
      filter.meetingId = meetingId;
    }

    const agendaItems = await AgendaItem.find(filter)
      .populate("responsibleUser", "name")
      .sort({ createdAt: 1 });

    res.status(200).json(agendaItems);
  } catch (error) {
    console.error("Error in getAllAgendaItems controller", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET single agenda item
export async function getAgendaItemById(req, res) {
  try {
    const agendaItem = await AgendaItem.findById(req.params.id).populate(
      "responsibleUser",
      "name",
    );
    if (!agendaItem)
      return res.status(404).json({ message: "Agenda item not found!" });
    res.json(agendaItem);
  } catch (error) {
    console.error("Error in getAgendaItemById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// CREATE agenda item
export async function createAgendaItem(req, res) {
  try {
    const agendaItem = req.body;
    const newAgendaItem = new AgendaItem(agendaItem);
    const savedAgendaItem = await newAgendaItem.save();
    const populated = await savedAgendaItem.populate("responsibleUser", "name");
    notifyChange("agendaItem", "created", populated._id);
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error in createAgendaItem controller", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

// UPDATE agenda item
export async function updateAgendaItem(req, res) {
  try {
    const existing = await AgendaItem.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ message: "Agenda item not found" });

    // Ein anderes meetingId verschiebt das Traktandum in dieses Meeting
    const targetMeetingId =
      req.body.meetingId && String(req.body.meetingId) !== String(existing.meetingId)
        ? req.body.meetingId
        : null;

    if (targetMeetingId) {
      if (!(await Meeting.exists({ _id: targetMeetingId }))) {
        return res.status(400).json({ message: "Target meeting not found" });
      }
      if (await hasContent(existing._id)) {
        return res.status(409).json({
          message: "Agenda item has content and cannot be moved",
        });
      }
    }

    const updatedAgendaItem = await AgendaItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    ).populate("responsibleUser", "name");

    notifyChange("agendaItem", "updated", updatedAgendaItem._id);
    res.status(200).json(updatedAgendaItem);
  } catch (error) {
    console.error("Error in updateAgendaItem controller", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE agenda item
export async function deleteAgendaItem(req, res) {
  try {
    const existing = await AgendaItem.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ message: "Agenda item not found" });

    if (await hasContent(existing._id)) {
      return res.status(409).json({
        message: "Agenda item has content and cannot be deleted",
      });
    }

    const deletedAgendaItem = await AgendaItem.findByIdAndDelete(existing._id);

    notifyChange("agendaItem", "deleted", deletedAgendaItem._id);
    res.status(200).json({ message: "Agenda item deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteAgendaItem controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
