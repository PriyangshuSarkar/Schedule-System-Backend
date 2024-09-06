import { Router } from "express";
import { adminLogin, signOut, userLogin } from "../controller/user";

const userRoutes: Router = Router();

userRoutes.post("/login", userLogin);

userRoutes.post("/admin/login", adminLogin);

userRoutes.post("/signout", signOut);

export default userRoutes;
