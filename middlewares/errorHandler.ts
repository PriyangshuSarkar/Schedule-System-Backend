import type { Request, Response, NextFunction } from "express";
import { rm } from "fs";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  return res.status(status).json({
    message,
    error: err,
  });
};
