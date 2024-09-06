import { tryCatch } from "../middlewares/tryCatch";
import type { Request, Response } from "express";
import type { AdminLoginRequest, UserLoginRequest } from "../types/user";
import UserSchema from "../models/user";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";

export const userLogin = tryCatch(
  async (req: Request<{}, {}, UserLoginRequest>, res: Response) => {
    const { name, email, password } = req.body;

    // Find user by email
    let user = await UserSchema.findOne({ email }).select("name password role");

    if (user) {
      // Check if the role is 'USER'
      if (user.role !== "USER") {
        return res.status(403).json({ message: "Unauthorized role" });
      }

      // Check if the password is correct
      console.log(user.password);
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate a JWT token
      const token = sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      });

      return res
        .status(200)
        .cookie("authToken", token, {
          httpOnly: true,
          maxAge:
            parseInt(process.env.JWT_EXPIRATION_TIME!, 10) *
            24 *
            60 *
            60 *
            1000,
        })
        .json({ message: "Login successful", user: user.name, token });
    } else {
      // If the user does not exist, create a new user
      const hashedPassword = await hash(password, 10);

      user = new UserSchema({
        name,
        email,
        password: hashedPassword,
        role: "USER",
      });

      await user.save();

      // Generate a JWT token for the new user
      const token = sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      });

      return res
        .status(201)
        .cookie("authToken", token, {
          httpOnly: true,
          maxAge:
            parseInt(process.env.JWT_EXPIRATION_TIME!, 10) *
            24 *
            60 *
            60 *
            1000,
        })
        .json({ message: "User created successfully", user: user.name, token });
    }
  }
);

export const adminLogin = tryCatch(
  async (req: Request<{}, {}, AdminLoginRequest>, res: Response) => {
    const { name, email, password } = req.body;

    // Find user by email
    let user = await UserSchema.findOne({ email }).select("name password role");

    if (user) {
      // Check if the role is 'ADMIN'
      if (user.role !== "ADMIN") {
        return res.status(403).json({ message: "Unauthorized role" });
      }

      // Check if the password is correct
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate a JWT token
      const token = sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      });

      return res
        .status(200)
        .cookie("authToken", token, {
          httpOnly: true,
          maxAge:
            parseInt(process.env.JWT_EXPIRATION_TIME!, 10) *
            24 *
            60 *
            60 *
            1000,
        })
        .json({ message: "Login successful", user: user.name, token });
    } else {
      // If the user does not exist, create a new user
      const hashedPassword = await hash(password, 10);

      user = new UserSchema({
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      });

      await user.save();

      // Generate a JWT token for the new user
      const token = sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      });

      return res
        .status(201)
        .cookie("authToken", token, {
          httpOnly: true,
          maxAge:
            parseInt(process.env.JWT_EXPIRATION_TIME!, 10) *
            24 *
            60 *
            60 *
            1000,
        })
        .json({ message: "User created successfully", user: user.name, token });
    }
  }
);

export const signOut = tryCatch(async (req: Request, res: Response) => {
  // Clear the auth token cookie
  return res
    .status(200)
    .clearCookie("authToken", {
      httpOnly: true,
      // Optionally, set the same options as during login
      maxAge: 0,
    })
    .json({ message: "Sign out successful" });
});
