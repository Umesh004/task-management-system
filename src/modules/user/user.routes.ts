import { Router } from "express";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validate } from "../../middleware/validate";

import { Role } from "@prisma/client";

import { createTeamUser } from "./user.controller";
import { createUserSchema } from "./user.schema";

const router = Router();

router.post(
  "/create-user",
  authenticate,
  authorize([Role.ADMIN]),
  validate(createUserSchema),
  asyncHandler(createTeamUser),
);

export default router;
