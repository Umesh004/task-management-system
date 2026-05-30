import { Role } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "name must be at least 3 characters"),

  email: z.email("invalid email format").trim().toLowerCase(),

  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
      "password must contain uppercase, lowercase, number and special character",
    ),

  role: z.enum([Role.MANAGER, Role.MEMBER]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
