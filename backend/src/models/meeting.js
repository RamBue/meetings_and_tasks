import mongoose from "mongoose";
import { CATEGORIES } from "../config/categories.js";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },

    description: {
      type: String,
    },

    location: {
      type: String,
      trim: true,
    },

    startsAt: {
      type: Date,
      required: true,
    },

    endsAt: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startsAt;
        },
        message: "End date must be after start date",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    chair: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    businessUnitLeads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    excusedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    guests: {
      type: String,
      trim: true,
    },

    minutesBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    protocolFileName: {
      type: String,
    },

    protocolOriginalName: {
      type: String,
    },

    protocolUploadedAt: {
      type: Date,
    },

    protocolApproved: {
      type: Boolean,
      default: false,
    },

    protocolCorrections: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
