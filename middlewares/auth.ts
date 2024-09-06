import type { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { tryCatch } from "./tryCatch";
import UserSchema from "../models/user";

// Define a type for the decoded JWT payload
interface DecodedToken {
  userId: string;
}

export const authMiddleware = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // const authHeader = req.headers.authorization;
    const token = req.cookies.authToken;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No cookie provided!" });
    }

    let decoded: DecodedToken;

    // Verify the token and decode it
    decoded = verify(token, process.env.JWT_SECRET!) as DecodedToken;

    // Fetch the user based on the userId from the token
    const user = await UserSchema.findById(decoded.userId).select(
      "_id name email role"
    );

    if (!user) {
      return res.status(401).json({ error: "Unauthorized User!" });
    }

    // Attach the user to the request object
    req.user = user;

    next();
  }
);
