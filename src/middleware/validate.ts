import { Request, Response, NextFunction } from "express";

import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "query" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(source === "body" ? req.body : req.query);

    if (source === "body") {
      req.body = parsed;
    } else {
      Object.assign(req.query, parsed);
    }

    next();
  };
