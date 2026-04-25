import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import User, { UserRole } from "../../models/user.model";
import Account from "../../models/account.model";
import Session from "../../models/session.model";
import type { IServerResponse } from "../../types";
import type { Request, Response } from "express";
import SiteSettings from "../../models/settings.model";
import {
  hashPassword,
  verifyPassword,
  createUserSession,
  setAuthCookies,
  clearAuthCookies,
} from "../../lib/auth-utils";

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *         data:
 *           type: null
 */

/**
 * OAuth login/signup handler
 */
export async function loginOauth({
  name,
  email,
  loginid,
}: {
  name: string;
  email: string;
  loginid: string;
}): Promise<IServerResponse> {
  try {
    if (!name || !email || !loginid) {
      return {
        status: "error",
        message: "Please enter all fields",
        data: null,
      };
    }

    // Check if user exists
    let user = await User.findOne({ email });
    let settings = await SiteSettings.findOne();

    if (!settings) {
      return {
        status: "error",
        message: "Error fetching site settings",
        data: null,
      };
    }

    if (user) {
      user.lastLogin = new Date();
      await user.save();

      const {
        accessToken,
        sessionId,
        user: userPayload,
      } = createUserSession(user);

      // Create session in database
      await Session.create({
        sessionId,
        userId: user._id,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isValid: true,
      });

      return {
        status: "success",
        message: "Login successful!",
        data: {
          user: userPayload,
          accessToken,
        },
      };
    }

    if (settings?.allowSignup === false) {
      return {
        status: "error",
        message:
          "We're not accepting new users at the moment. Please try again later.",
        data: null,
      };
    }

    let newUser = new User({
      name,
      email,
      image: "",
    });

    let savedUser = await newUser.save();

    // Create account entry for OAuth
    await Account.create({
      accountId: loginid,
      providerId: "oauth",
      userId: savedUser._id,
    });

    const {
      accessToken,
      sessionId,
      user: userPayload,
    } = createUserSession(savedUser);

    // Create session in database
    await Session.create({
      sessionId,
      userId: savedUser._id,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isValid: true,
    });

    return {
      status: "success",
      message: "Account created successfully",
      data: {
        user: userPayload,
        accessToken,
      },
    };
  } catch (err) {
    return {
      status: "error",
      message: "Error creating user",
      data: null,
    };
  }
}

/**
 * @openapi
 * /api/v1/user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Account created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const createUser = async (
  req: Request,
  res: Response<IServerResponse>,
) => {
  const { name, email, password } = req.body;
  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Please provide name, email, and password",
        data: null,
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    let settings = await SiteSettings.findOne();

    if (user) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Account already exists. Please login!",
        data: null,
      });
    }

    if (!settings) {
      return res.status(HttpStatusCode.InternalServerError).json({
        status: "error",
        message: "Error fetching site settings",
        data: null,
      });
    }

    if (settings?.allowSignup === false) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message:
          "We're not accepting new users at the moment. Please try again later.",
        data: null,
      });
    }

    // Create user
    let newUser = new User({
      name,
      email,
      role: UserRole.RECRUITER,
    });

    let savedUser = await newUser.save();

    // Hash password and create account
    const hashedPassword = await hashPassword(password);
    await Account.create({
      userId: savedUser._id,
      password: hashedPassword,
      providerId: "credentials",
    });

    // Create session
    const { accessToken, sessionId } = createUserSession(savedUser);

    await Session.create({
      sessionId,
      userId: savedUser._id,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isValid: true,
    });

    // Set cookies
    setAuthCookies(res, accessToken, true);

    res.status(HttpStatusCode.Created).json({
      status: "success",
      message: "Account created successfully",
      data: {
        user: {
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          phone: savedUser.phone,
          role: savedUser.role,
        },
      },
    });
  } catch (err) {
    Logger.error({ message: "Error creating user" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error creating user",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     token:
 *                       type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export const loginUser = async (
  req: Request,
  res: Response<IServerResponse>,
) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Please provide email and password",
        data: null,
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Invalid email or password",
        data: null,
      });
    }

    // Get account and verify password
    const account = await Account.findOne({ userId: user._id });

    if (!account || !account.password) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Invalid email or password",
        data: null,
      });
    }

    const isPasswordValid = await verifyPassword(password, account.password);

    if (!isPasswordValid) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Invalid email or password",
        data: null,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create session
    const { accessToken, sessionId } = createUserSession(user);

    await Session.create({
      sessionId,
      userId: user._id,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isValid: true,
    });

    // Set cookies
    setAuthCookies(res, accessToken, true);

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "User logged in successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (err) {
    Logger.error({ message: "Error logging in user" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error logging in user",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/user/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User logged out successfully
 *                 data:
 *                   type: null
 */
export const logoutUser = async (
  req: Request,
  res: Response<IServerResponse>,
) => {
  try {
    // Invalidate session if user is authenticated
    if (req.session?.sessionId) {
      await Session.findOneAndUpdate(
        { sessionId: req.session.sessionId },
        { isValid: false },
      );
    }

    // Clear auth cookies
    clearAuthCookies(res);

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "User logged out successfully",
      data: null,
    });
  } catch (err) {
    Logger.error({ message: "Error logging out user" + err });

    // Still clear cookies even if session invalidation fails
    clearAuthCookies(res);

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "User logged out successfully",
      data: null,
    });
  }
};
