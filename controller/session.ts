import type { Request, Response } from "express";
import { tryCatch } from "../middlewares/tryCatch";
import SessionSchema from "../models/session";
import type {
  ConfirmSessionRequest,
  CreateSessionRequest,
  RescheduleSessionRequest,
  SessionIdRequest,
} from "../types/session";

export const createSession = tryCatch(
  async (req: Request<{}, {}, CreateSessionRequest>, res: Response) => {
    const user = req.user;

    if (user.role !== "USER") {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    // Check for overlapping sessions
    const existingSession = await SessionSchema.findOne({
      createdBy: user._id,
      start: req.body.start, // Check if existing session ends after the new session starts
      end: req.body.end, // Check if existing session starts before the new session ends
    });

    if (existingSession) {
      return res.status(409).json({ message: "Time slot already booked" });
    }

    const newSession = new SessionSchema({
      createdBy: req.user._id, // Assuming the admin's ID is in req.user
      user: user.email,
      start: req.body.start,
      end: req.body.end,
      duration: req.body.duration,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
    });

    await newSession.save();

    res.status(201).json({
      message: "Session scheduled successfully",
      session: newSession,
    });
  }
);

export const confirmSession = tryCatch(
  async (
    req: Request<SessionIdRequest, {}, ConfirmSessionRequest>,
    res: Response
  ) => {
    const user = req.user;

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    // Find the session by ID
    const session = await SessionSchema.findById(req.params.sessionId).select(
      "start end scheduledSlots status"
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Ensure session is in 'pending' status before confirming
    if (session.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending sessions can be confirmed" });
    }

    // Check for conflicts with other confirmed sessions
    const conflictingSessions = await SessionSchema.find({
      _id: { $ne: session._id },
      status: "scheduled",
      $or: [
        {
          start: { $lt: session.end },
          end: { $gt: session.start },
        },
      ],
    });

    if (conflictingSessions.length > 0) {
      return res
        .status(409)
        .json({ message: "Conflict with existing confirmed sessions" });
    }

    // Update the session with the provided scheduled slots
    session.scheduledSlots.push({
      start: session.start,
      end: session.end,
      attendees: req.body.attendees,
    });

    // Change status to 'scheduled'
    session.status = "scheduled";
    session.updatedAt = new Date();

    // Save the updated session
    await session.save();

    res.status(200).json({
      message: "Session confirmed successfully",
      session,
    });
  }
);

export const deleteSession = tryCatch(
  async (req: Request<SessionIdRequest>, res: Response) => {
    const user = req.user;

    // Find the session by ID
    const session = await SessionSchema.findById(req.params.sessionId).select(
      "createdBy"
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if the session was created by the current user
    if (session.createdBy.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this session" });
    }

    // Delete the session
    await SessionSchema.findByIdAndDelete(req.params.sessionId);

    res.status(200).json({
      message: "Session deleted successfully",
    });
  }
);

export const unscheduleSession = tryCatch(
  async (req: Request<SessionIdRequest>, res: Response) => {
    const user = req.user;

    // Check if the user is an admin
    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    // Find the session by ID
    const session = await SessionSchema.findById(req.params.sessionId).select(
      "status"
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Change the session status to 'canceled'
    session.status = "canceled";
    session.updatedAt = new Date();

    // Save the updated session
    await session.save();

    res.status(200).json({
      message: "Session unscheduled successfully",
      session,
    });
  }
);

export const rescheduleSession = tryCatch(
  async (
    req: Request<SessionIdRequest, {}, RescheduleSessionRequest>,
    res: Response
  ) => {
    const user = req.user;

    // Find the session by ID
    const session = await SessionSchema.findById(req.params.sessionId).select(
      "createdBy start end status"
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if the user is an admin or the creator of the session
    if (
      user.role !== "ADMIN" &&
      session.createdBy.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to reschedule this session" });
    }

    // Extract new start and end times from the request body
    const { start, end } = req.body;

    // Ensure the session is in a state that allows rescheduling
    if (session.status !== "scheduled") {
      return res
        .status(400)
        .json({ message: "Only scheduled sessions can be rescheduled" });
    }

    // Check for conflicts with other confirmed sessions
    const conflictingSessions = await SessionSchema.find({
      _id: { $ne: session._id }, // Exclude the current session
      status: "scheduled",
      $or: [
        {
          start: { $lt: end },
          end: { $gt: start },
        },
      ],
    });

    if (conflictingSessions.length > 0) {
      return res
        .status(409)
        .json({ message: "Conflict with existing confirmed sessions" });
    }

    // Update the session with new start and end times
    session.start = start;
    session.end = end;
    session.updatedAt = new Date();

    // Save the updated session
    await session.save();

    res.status(200).json({
      message: "Session rescheduled successfully",
      session,
    });
  }
);

export const getAllSessions = tryCatch(async (req: Request, res: Response) => {
  const user = req.user;

  // Check if the user is an admin
  if (user.role !== "ADMIN") {
    return res.status(403).json({ message: "Unauthorized role" });
  }

  // Fetch all sessions
  const sessions = await SessionSchema.find().sort({ createdAt: -1 });

  res.status(200).json({
    message: "All sessions retrieved successfully",
    sessions,
  });
});

export const getUserSessions = tryCatch(async (req: Request, res: Response) => {
  const user = req.user;

  // Fetch all sessions created by the current user
  const sessions = await SessionSchema.find({ createdBy: user._id }).sort({
    createdAt: -1,
  });

  if (sessions.length === 0) {
    return res.status(404).json({ message: "No sessions found for this user" });
  }

  res.status(200).json({
    message: "User sessions retrieved successfully",
    sessions,
  });
});
