import { Request, Response } from "express";

import { createTask, getTasks } from "./task.service";

import { sendResponse } from "../../utils/response";

export const createTaskController = async (req: Request, res: Response) => {
  const result = await createTask(req.body, req.user!.organizationId);

  return sendResponse(res, 201, "Task created successfully", result);
};

export const getTasksController = async (req: Request, res: Response) => {
  const result = await getTasks(req.query as any, req.user!);

  return sendResponse(res, 200, "Tasks fetched successfully", result);
};
