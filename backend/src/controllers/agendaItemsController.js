import AgendaItem from "../models/agendaItem.js";

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
    const updatedAgendaItem = await AgendaItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    ).populate("responsibleUser", "name");
    if (!updatedAgendaItem)
      return res.status(404).json({ message: "Agenda item not found" });

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
    const deletedAgendaItem = await AgendaItem.findByIdAndDelete(
      req.params.id,
    );
    if (!deletedAgendaItem)
      return res.status(404).json({ message: "Agenda item not found" });
    res.status(200).json({ message: "Agenda item deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteAgendaItem controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
