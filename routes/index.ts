import { Router } from "express";
import userRoutes from "./user";
import sessionRoutes from "./session";

const rootRouter: Router = Router();

rootRouter.use("/user", userRoutes);

rootRouter.use("/session", sessionRoutes);

export default rootRouter;
