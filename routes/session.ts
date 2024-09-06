import { Router } from "express";
import {
  confirmSession,
  createSession,
  deleteSession,
  getAllSessions,
  getUserSessions,
  rescheduleSession,
  unscheduleSession,
} from "../controller/session";
import { authMiddleware } from "../middlewares/auth";

const sessionRoutes: Router = Router();

sessionRoutes.post("/create", authMiddleware, createSession);

sessionRoutes.put("/confirm/:sessionId", authMiddleware, confirmSession);

sessionRoutes.delete("/delete/:sessionId", authMiddleware, deleteSession);

sessionRoutes.put("/unschedule/:sessionId", authMiddleware, unscheduleSession);

sessionRoutes.put("/reschedule/:sessionId", authMiddleware, rescheduleSession);

sessionRoutes.get("/all", authMiddleware, getAllSessions);

sessionRoutes.get("/user/all", authMiddleware, getUserSessions);

export default sessionRoutes;
