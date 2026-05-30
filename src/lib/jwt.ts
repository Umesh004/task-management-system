import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export const generateAccessToken = (
  userId: string,
  role: string,
  organizationId: string,
) => {
  const payload = {
    userId,
    role,
    organizationId,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (userId: string) => {
  const payload = {
    userId,
  };

  const secret: Secret = env.JWT_REFRESH_SECRET;

  const options: SignOptions = {
    expiresIn: env.REFRESH_TOKEN_EXPIRES as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as {
    userId: string;
  };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as {
    userId: string;
    role: string;
    organizationId: string;
  };
};
