import Information from "../models/information.js";
import { notifyChange } from "../config/socket.js";
import { pick } from "../utils/sanitize.js";
import { handleError } from "../utils/errors.js";

// Felder, die ein Client beim Anlegen setzen darf
const INFORMATION_FIELDS = ["topic", "description", "meetingId", "agendaItemId"];

// GET all informations
export async function getAllInformations(req, res) {
  try {
    const { meetingId, agendaItemId } = req.query;

    const filter = {};
    if (meetingId) {
      filter.meetingId = meetingId;
    }
    if (agendaItemId) {
      filter.agendaItemId = agendaItemId;
    }

    const informations = await Information.find(filter).sort({
      createdAt: 1,
    });

    res.status(200).json(informations);
  } catch (error) {
    console.error("Error in getAllInformations controller", error);
    handleError(res, error);
  }
}

// GET single information
export async function getInformationById(req, res) {
  try {
    const information = await Information.findById(req.params.id);
    if (!information)
      return res.status(404).json({ message: "Information not found!" });
    res.json(information);
  } catch (error) {
    console.error("Error in getInformationById controller", error);
    handleError(res, error);
  }
}

// CREATE information
export async function createInformation(req, res) {
  try {
    const information = pick(req.body, INFORMATION_FIELDS);
    const newInformation = new Information(information);
    const savedInformation = await newInformation.save();
    notifyChange("information", "created", savedInformation._id);
    res.status(201).json(savedInformation);
  } catch (error) {
    console.error("Error in createInformation controller", error);
    handleError(res, error);
  }
}

// UPDATE information
export async function updateInformation(req, res) {
  try {
    const { topic, description } = req.body;
    const updatedInformation = await Information.findByIdAndUpdate(
      req.params.id,
      { topic, description },
      { new: true },
    );
    if (!updatedInformation)
      return res.status(404).json({ message: "Information not found" });

    notifyChange("information", "updated", updatedInformation._id);
    res.status(200).json(updatedInformation);
  } catch (error) {
    console.error("Error in updateInformation controller", error);
    handleError(res, error);
  }
}

// DELETE information
export async function deleteInformation(req, res) {
  try {
    const deletedInformation = await Information.findByIdAndDelete(
      req.params.id,
    );
    if (!deletedInformation)
      return res.status(404).json({ message: "Information not found" });
    notifyChange("information", "deleted", deletedInformation._id);
    res.status(200).json({ message: "Information deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteInformation controller", error);
    handleError(res, error);
  }
}
