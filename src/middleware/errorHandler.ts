import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 400,
      code: "VALIDATION_ERROR",
      message: err.issues[0]?.message,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      code: err.code,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  });
};
