import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
  },
  scheduledSlots: [
    {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      attendees: [
        {
          name: {
            type: String,
            required: true,
          },
          email: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "scheduled", "canceled"],
    default: "pending",
  },
});

export default mongoose.model("Session", SessionSchema);
