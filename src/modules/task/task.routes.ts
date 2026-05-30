import { Router } from "express";

import { Role } from "@prisma/client";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validate } from "../../middleware/validate";

import {
  createTaskSchema,
  getTasksSchema,
  updateTaskStatusSchema,
  updateTaskSchema,
} from "./task.schema";
import {
  createTaskController,
  getTasksController,
  updateTaskStatusController,
  updateTaskController,
  deleteTaskController,
} from "./task.controller";

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

router.patch(
  "/:taskId/status",
  authenticate,
  validate(updateTaskStatusSchema),
  asyncHandler(updateTaskStatusController),
);

router.patch(
  "/:taskId",
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER]),
  validate(updateTaskSchema),
  asyncHandler(updateTaskController),
);

router.delete(
  "/:taskId",
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER]),
  asyncHandler(deleteTaskController),
);

export default router;
