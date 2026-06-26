import Task from "../models/task.js";

// GET all tasks
export async function getAllTasks(req, res) {
  try {
    const { status, meetingId, assignedUser } = req.query;

    const filter = {};

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by meeting
    if (meetingId) {
      filter.meetingId = meetingId;
    }

    if (assignedUser) {
      filter.assignedUser = assignedUser;
    }

    const tasks = await Task.find(filter)
      .populate("meetingId", "title startsAt")
      .sort({ dueDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error in getTasks controller", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET single task
export async function getTaskById(req, res) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found!" });
    res.json(task);
  } catch (error) {
    console.error("Error in getAllTasks controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// CREATE task
export async function createTask(req, res) {
  try {
    const task = req.body;
    const newTask = new Task(task);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error in createTask controller", error);
    // Mongoose Validation Error
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    // Fallback
    res.status(500).json({ message: "Internal server error" });
  }
}

// UPDATE task
export async function updateTask(req, res) {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error in updateTask controller", error);
    // Mongoose Validation Error
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    // Fallback
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE task
export async function deleteTask(req, res) {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask)
      return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteTask controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
