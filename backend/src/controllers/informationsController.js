import Information from "../models/information.js";

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

    res.status(500).json({
      message: "Internal server error",
    });
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
    res.status(500).json({ message: "Internal server error" });
  }
}

// CREATE information
export async function createInformation(req, res) {
  try {
    const information = req.body;
    const newInformation = new Information(information);
    const savedInformation = await newInformation.save();
    res.status(201).json(savedInformation);
  } catch (error) {
    console.error("Error in createInformation controller", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
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

    res.status(200).json(updatedInformation);
  } catch (error) {
    console.error("Error in updateInformation controller", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
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
    res.status(200).json({ message: "Information deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteInformation controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
