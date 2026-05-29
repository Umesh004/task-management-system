import { hashPassword, comparePassword } from "../../lib/bcrypt";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { RegisterInput, LoginInput, RefreshTokenInput } from "./auth.schema";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../lib/jwt";
import bcrypt from "bcrypt";

// REGISTER HANDLER
export const registerUser = async (payload: RegisterInput) => {
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
    },
  });

  const accessToken = generateAccessToken(user.id, user.role);

  const refreshToken = generateRefreshToken(user.id);

  const tokenHash = await bcrypt.hash(refreshToken, 10);

  await prisma.refreshToken.create({
    data: {
      tokenHash: tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

// LOGIN HANDLER
export const loginUser = async (payload: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    payload.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id, user.role);

  const refreshToken = generateRefreshToken(user.id);

  const tokenHash = await hashPassword(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

// REFRESH TOKEN & NEW AUTH TOKEN
export const refreshUserToken = async (payload: RefreshTokenInput) => {
  const { refreshToken } = payload;

  let decoded: {
    userId: string;
  };

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  if (!user) throw new ApiError(401, "USER_NOT_FOUND", "User not found");

  const savedTokens = await prisma.refreshToken.findMany({
    where: {
      userId: user.id,
    },
  });

  let matchedToken = null;

  for (const token of savedTokens) {
    const isMatch = await comparePassword(refreshToken, token.tokenHash);

    if (isMatch) {
      matchedToken = token;
      break;
    }
  }

  if (!matchedToken) {
    throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
  }

  // ROTATION: delete old token
  await prisma.refreshToken.delete({
    where: {
      id: matchedToken.id,
    },
  });

  const newAccessToken = generateAccessToken(user.id, user.role);

  const newRefreshToken = generateRefreshToken(user.id);

  const tokenHash = await hashPassword(newRefreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
