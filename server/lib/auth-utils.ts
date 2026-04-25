import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { CookieOptions, Response } from "express";
import { ENV } from "./environments";
import crypto from "crypto";
import { UserDoc } from "../models/user.model";

const JWT_SECRET = ENV.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const JWT_REFRESH_SECRET = ENV.JWT_REFRESH_SECRET || crypto.randomBytes(32).toString("hex");

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  version?: number;
}

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: ENV.NODE_ENV === "production",
  sameSite: ENV.NODE_ENV === "production" ? "strict" : "lax",
  path: "/",
};

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d", // Short lived
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "60d", // Long lived
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = true,
) => {
  const refreshTokenExpiry = rememberMe ? 60 * 24 * 60 * 60 * 1000 : undefined;
  const accessTokenExpiry = rememberMe ? 24 * 60 * 60 * 1000 : undefined;

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: accessTokenExpiry,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: refreshTokenExpiry,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, COOKIE_OPTIONS);
  res.clearCookie(REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS);
};

export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const createUserSession = (user: UserDoc) => {
  const sessionId = generateSessionId();

  const tokenPayload: TokenPayload = {
    userId: (user as any)._id.toString(),
    email: user.email,
    role: user.role,
    sessionId,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    accessToken,
    refreshToken,
    sessionId,
    user: {
      _id: (user as any)._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  };
};
