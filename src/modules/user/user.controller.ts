import { Request, Response } from "express";

import { createUser } from "./user.service";
import { sendResponse } from "../../utils/response";

export const createTeamUser = async (req: Request, res: Response) => {
  const result = await createUser(req.body, req.user!.organizationId);

  return sendResponse(res, 201, "User created successfully", result);
};
