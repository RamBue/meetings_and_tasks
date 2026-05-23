import Task from "../models/task.js";
import Meeting from "../models/meeting.js";

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
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    const tasks = await Task.find({ meetingId: req.params.id });

    res.status(200).json({ meeting, tasks });
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

// DELETE meeting
export async function deleteMeeting(req, res) {
  try {
    const deletedMeeting = await Meeting.findByIdAndDelete(req.params.id);

    if (!deletedMeeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
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
