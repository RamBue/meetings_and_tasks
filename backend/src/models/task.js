import mongoose from "mongoose";

// 1 - create a schema
// 2 - create model based off of that schema

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assignedUser: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "done"],
      default: "open",
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
