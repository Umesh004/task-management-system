import { Request, Response } from "express";

import { createTask, getTasks, updateTaskStatus } from "./task.service";

import { sendResponse } from "../../utils/response";

export const createTaskController = async (req: Request, res: Response) => {
  const result = await createTask(req.body, req.user!.organizationId);

  return sendResponse(res, 201, "Task created successfully", result);
};

export const getTasksController = async (req: Request, res: Response) => {
  const result = await getTasks(req.query as any, req.user!);

  return sendResponse(res, 200, "Tasks fetched successfully", result);
};

export const updateTaskStatusController = async (
  req: Request,
  res: Response,
) => {
  const result = await updateTaskStatus(
    String(req.params.taskId),
    req.body.status,
    req.user!,
  );

  return sendResponse(res, 200, "Task status updated successfully", result);
};
