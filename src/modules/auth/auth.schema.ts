import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "name must be at least 3 characters"),

  email: z.email("invalid email format").trim().toLowerCase(),

  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
      "password must contain uppercase, lowercase, number and special character",
    ),

  organizationName: z
    .string()
    .min(3, "organization name must be at least 3 characters"),
});

// LOGIN SCHEMA
export const loginSchema = z.object({
  email: z.email("Invalid email format").trim().toLowerCase(),

  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
