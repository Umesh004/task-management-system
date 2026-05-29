import { Request, Response } from "express";
import { registerUser, loginUser, refreshUserToken } from "./auth.service";
import { sendResponse } from "../../utils/response";

export const register = async (req: Request, res: Response) => {
  const result = await registerUser(req.body);

  return sendResponse(res, 201, "User registered successfully", result);
};

export const login = async (req: Request, res: Response) => {
  const result = await loginUser(req.body);

  return sendResponse(res, 200, "Login successful", result);
};

export const refreshToken = async (req: Request, res: Response) => {
  const result = await refreshUserToken(req.body);

  return sendResponse(res, 200, "Token refreshed successfully", result);
};
