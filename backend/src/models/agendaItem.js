import mongoose from "mongoose";

const agendaItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    responsibleUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    plannedFrom: {
      type: String,
      trim: true,
    },

    plannedTo: {
      type: String,
      trim: true,
    },

    actualFrom: {
      type: String,
      trim: true,
    },

    actualTo: {
      type: String,
      trim: true,
    },

    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },
  },
  { timestamps: true },
);

const AgendaItem = mongoose.model("AgendaItem", agendaItemSchema);

export default AgendaItem;
