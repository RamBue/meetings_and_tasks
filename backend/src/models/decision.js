import mongoose from "mongoose";

const decisionSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
    },

    topic: {
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
      required: true,
    },

    agendaItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgendaItem",
      required: true,
    },
  },
  { timestamps: true },
);

const Decision = mongoose.model("Decision", decisionSchema);

export default Decision;
