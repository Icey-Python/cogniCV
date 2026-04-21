import { Request, Response, NextFunction } from "express";
import { IServerResponse } from "../types";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  setAuthCookies,
  clearAuthCookies,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  TokenPayload,
} from "../lib/auth-utils";
import User from "../models/user.model";
import Session from "../models/session.model";
import { UserRole } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

export interface AuthOptions {
  /**
   * If true, allows unauthenticated users to access the route
   * @default false
   */
  isOptional?: boolean;

  /**
   * Required role(s) for access. Use 'ALL' to allow any authenticated user.
   * Can be a single role or an array of roles.
   * @default 'ALL'
   */
  roleRequired?: UserRole | UserRole[] | "ALL";
}

/**
 * Unified authentication middleware with configurable options
 * @param options - Authentication configuration options
 * @returns Express middleware function
 *
 * @example
 * // Require authentication, any role
 * router.get('/profile', authenticate(), handler);
 *
 * @example
 * // Require admin role
 * router.get('/admin', authenticate({ roleRequired: UserRole.ADMIN }), handler);
 *
 * @example
 * // Allow multiple roles
 * router.get('/dashboard', authenticate({ roleRequired: [UserRole.ADMIN, UserRole.USER] }), handler);
 *
 * @example
 * // Optional authentication
 * router.get('/public', authenticate({ isOptional: true }), handler);
 */
export const authenticate = (options: AuthOptions = {}) => {
  const { isOptional = false, roleRequired = "ALL" } = options;

  return async (
    req: Request,
    res: Response<IServerResponse>,
    next: NextFunction
  ) => {
    try {
      const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

      // Handle missing authentication tokens
      if (!accessToken && !refreshToken) {
        if (isOptional) {
          return next();
        }
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
          data: null,
        });
      }

      let tokenPayload: TokenPayload | null = null;

      // Try to verify access token
      if (accessToken) {
        try {
          tokenPayload = verifyAccessToken(accessToken);
        } catch (error) {
          // Access token expired or invalid, try refresh token
          if (refreshToken) {
            try {
              const refreshPayload = verifyRefreshToken(refreshToken);

              // Verify session is still valid
              const session = await Session.findOne({
                sessionId: refreshPayload.sessionId,
                isValid: true,
              });

              if (!session) {
                clearAuthCookies(res);
                if (isOptional) {
                  return next();
                }
                return res.status(401).json({
                  status: "error",
                  message: "Session expired",
                  data: null,
                });
              }

              // Update last activity
              session.lastActivity = new Date();
              await session.save();

              // Generate new access token
              const newAccessToken = generateAccessToken({
                userId: refreshPayload.userId,
                email: refreshPayload.email,
                role: refreshPayload.role,
                sessionId: refreshPayload.sessionId,
              });

              // Set new access token in cookie
              setAuthCookies(res, newAccessToken, refreshToken, true);
              tokenPayload = refreshPayload;
            } catch (refreshError) {
              clearAuthCookies(res);
              if (isOptional) {
                return next();
              }
              return res.status(401).json({
                status: "error",
                message: "Invalid authentication",
                data: null,
              });
            }
          } else {
            if (isOptional) {
              return next();
            }
            return res.status(401).json({
              status: "error",
              message: "Authentication expired",
              data: null,
            });
          }
        }
      }

      if (!tokenPayload) {
        if (isOptional) {
          return next();
        }
        return res.status(401).json({
          status: "error",
          message: "Invalid authentication",
          data: null,
        });
      }

      // Get user from database
      const user = await User.findById(tokenPayload.userId).select("-__v");

      if (!user) {
        clearAuthCookies(res);
        if (isOptional) {
          return next();
        }
        return res.status(401).json({
          status: "error",
          message: "User not found",
          data: null,
        });
      }

      // Check if account is enabled (skip if optional and user exists)
      if ((user as any).enableAccount === false) {
        clearAuthCookies(res);
        if (isOptional) {
          return next();
        }
        return res.status(403).json({
          status: "error",
          message: "Account is disabled",
          data: null,
        });
      }

      // Attach user and session to request
      req.user = {
        _id: (user as any)._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        verified: (user as any).verified,
        currentStatus: (user as any).currentStatus,
        profileImage: (user as any).profileImage,
        location: (user as any).location,
        phone: user.phone,
        enableAccount: (user as any).enableAccount,
        lastLogin: (user as any).lastLogin,
      };

      req.session = {
        sessionId: tokenPayload.sessionId,
        user: req.user,
      };

      // Check role requirements
      if (roleRequired !== "ALL") {
        const allowedRoles = Array.isArray(roleRequired)
          ? roleRequired
          : [roleRequired];

        if (!allowedRoles.includes(user.role as UserRole)) {
          return res.status(403).json({
            status: "error",
            message: "Insufficient permissions",
            data: null,
          });
        }
      }

      next();
    } catch (error: any) {
      if (isOptional) {
        return next();
      }
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication",
        data: null,
      });
    }
  };
};
