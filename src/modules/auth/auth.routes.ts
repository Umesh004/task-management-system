import { Router } from "express";
import { register, login, refreshToken } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.schema";
import { asyncHandler } from "../../middleware/asyncHandler";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));

router.post("/login", validate(loginSchema), asyncHandler(login));

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  asyncHandler(refreshToken),
);

export default router;
