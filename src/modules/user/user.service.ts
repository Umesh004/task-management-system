import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/bcrypt";
import { ApiError } from "../../utils/ApiError";
import { CreateUserInput } from "./user.schema";

export const createUser = async (
  payload: CreateUserInput,
  organizationId: string,
) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new ApiError(409, "USER_ALREADY_EXISTS", "Email already exists");
  }

  const hashedPassword = await hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      organizationId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organizationId: true,
    },
  });

  return user;
};
