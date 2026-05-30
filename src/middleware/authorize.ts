import { Request, Response, NextFunction } from "express";

import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

export const authorize =
  (roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "FORBIDDEN", "Access denied"));
    }

    next();
  };
