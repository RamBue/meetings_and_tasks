import Decision from "../models/decision.js";
import { notifyChange } from "../config/socket.js";
import { isObjectIdString } from "../utils/sanitize.js";
import { handleError } from "../utils/errors.js";

// GET all decisions
export async function getAllDecisions(req, res) {
  try {
    const { meetingId, agendaItemId } = req.query;

    const filter = {};
    if (meetingId) {
      filter.meetingId = meetingId;
    }
    if (agendaItemId) {
      filter.agendaItemId = agendaItemId;
    }

    const decisions = await Decision.find(filter).sort({ number: 1 });

    res.status(200).json(decisions);
  } catch (error) {
    console.error("Error in getAllDecisions controller", error);
    handleError(res, error);
  }
}

// GET single decision
export async function getDecisionById(req, res) {
  try {
    const decision = await Decision.findById(req.params.id);
    if (!decision)
      return res.status(404).json({ message: "Decision not found!" });
    res.json(decision);
  } catch (error) {
    console.error("Error in getDecisionById controller", error);
    handleError(res, error);
  }
}

// CREATE decision
export async function createDecision(req, res) {
  try {
    const { meetingId, agendaItemId, topic, description } = req.body;

    // meetingId fliesst in eine Abfrage ein und muss deshalb ein reiner Text sein
    if (!isObjectIdString(meetingId)) {
      return res.status(400).json({ message: "Invalid meetingId" });
    }

    const lastDecision = await Decision.findOne({ meetingId }).sort({
      number: -1,
    });
    const number = lastDecision ? lastDecision.number + 1 : 1;

    const newDecision = new Decision({
      number,
      topic,
      description,
      meetingId,
      agendaItemId,
    });
    const savedDecision = await newDecision.save();
    notifyChange("decision", "created", savedDecision._id);
    res.status(201).json(savedDecision);
  } catch (error) {
    console.error("Error in createDecision controller", error);
    handleError(res, error);
  }
}

// UPDATE decision
export async function updateDecision(req, res) {
  try {
    const { topic, description } = req.body;
    const updatedDecision = await Decision.findByIdAndUpdate(
      req.params.id,
      { topic, description },
      { new: true },
    );
    if (!updatedDecision)
      return res.status(404).json({ message: "Decision not found" });

    notifyChange("decision", "updated", updatedDecision._id);
    res.status(200).json(updatedDecision);
  } catch (error) {
    console.error("Error in updateDecision controller", error);
    handleError(res, error);
  }
}

// DELETE decision
export async function deleteDecision(req, res) {
  try {
    const deletedDecision = await Decision.findByIdAndDelete(req.params.id);
    if (!deletedDecision)
      return res.status(404).json({ message: "Decision not found" });
    notifyChange("decision", "deleted", deletedDecision._id);
    res.status(200).json({ message: "Decision deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteDecision controller", error);
    handleError(res, error);
  }
}
