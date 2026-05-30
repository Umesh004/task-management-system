import { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../lib/jwt";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "UNAUTHORIZED", "Access token required"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role as any,
      organizationId: decoded.organizationId,
    };

    next();
  } catch {
    next(new ApiError(401, "INVALID_TOKEN", "Invalid or expired token"));
  }
};
