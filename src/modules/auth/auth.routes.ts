import { Router } from "express";
import { register, login, refreshToken, getMe } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.schema";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));

router.post("/login", validate(loginSchema), asyncHandler(login));

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  asyncHandler(refreshToken),
);

router.get("/me", authenticate, asyncHandler(getMe));

export default router;
