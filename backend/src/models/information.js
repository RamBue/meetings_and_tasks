import mongoose from "mongoose";

const informationSchema = new mongoose.Schema(
  {
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

const Information = mongoose.model("Information", informationSchema);

export default Information;
