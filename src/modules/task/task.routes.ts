import { Router } from "express";

import { Role } from "@prisma/client";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validate } from "../../middleware/validate";

import { createTaskSchema, getTasksSchema } from "./task.schema";
import { createTaskController, getTasksController } from "./task.controller";

const router = Router();

router.post(
  "/create-task",
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER]),
  validate(createTaskSchema),
  asyncHandler(createTaskController),
);

router.get(
  "/get-tasks",
  authenticate,
  validate(getTasksSchema, "query"),
  asyncHandler(getTasksController),
);

export default router;
