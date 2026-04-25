import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import User from "../../models/user.model";
import type { IServerResponse } from "../../types";
import type { Request, Response } from "express";
import Account from "../../models/account.model";
import { hashPassword, verifyPassword } from "../../lib/auth-utils";

/**
 * @openapi
 * /api/v1/user/me:
 *   get:
 *     summary: Get currently logged in user details
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const getLoggedInUser = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HttpStatusCode.Unauthorized).json({
        status: "error",
        message: "Authentication required",
        data: null,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "User not found",
        data: null,
      });
    }

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "User found",
      data: user,
    });
  } catch (err) {
    Logger.error({ message: "Error getting logged in user" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error getting user",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/user:
 *   get:
 *     summary: Get user details
 *     tags: [Users]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User found
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
 *                   example: User found
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export const getUser = async (req: Request, res: Response<IServerResponse>) => {
  const { id } = req.query;
  try {
    if (!id) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Please enter all fields",
        data: null,
      });
    }

    let user = await User.findById(id);

    if (!user) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "User not found",
        data: null,
      });
    }

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "User found",
      data: user,
    });
  } catch (err) {
    Logger.error({ message: "Error getting user" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error getting user",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/user:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - adminUserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export const updateUser = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  try {
    const { name, email } = req.body;

    const userId = req.user?._id;

    if (!userId) {
      return res.status(HttpStatusCode.Unauthorized).json({
        status: "error",
        message: "Authentication required",
        data: null,
      });
    }

    let user = await User.findById(userId);

    if (!user) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "User not found",
        data: null,
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    let updatedUser = await user.save();

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    Logger.error({ message: "Error updating user" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error updating user",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/user/phone:
 *   put:
 *     summary: Update user phone
 *     tags: [Users]
 *     security:
 *       - adminUserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     phone:
 *                       type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export const updateUserPhone = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  const { phone } = req.body;
  const userId = req.user?._id;

  try {
    if (!userId) {
      return res.status(HttpStatusCode.Unauthorized).json({
        status: "error",
        message: "Authentication required",
        data: null,
      });
    }

    if (!phone) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Missing phone",
        data: {
          body: {
            phone: "string",
          },
        },
      });
    }

    let user = await User.findByIdAndUpdate(userId, { phone }, { new: true });

    if (!user) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "User not found",
        data: null,
      });
    }

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "User updated successfully",
      data: {
        phone: user.phone,
      },
    });
  } catch (err) {
    Logger.error({ message: "Error updating phone" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error updating phone",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/user/password:
 *   put:
 *     summary: Update user password
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const updatePassword = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?._id;

  try {
    if (!userId) {
      return res.status(HttpStatusCode.Unauthorized).json({
        status: "error",
        message: "Authentication required",
        data: null,
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Missing current or new password",
        data: null,
      });
    }

    const account = await Account.findOne({ userId });

    if (!account || !account.password) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Account not found or invalid",
        data: null,
      });
    }

    const isPasswordValid = await verifyPassword(currentPassword, account.password);

    if (!isPasswordValid) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Invalid current password",
        data: null,
      });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    account.password = hashedNewPassword;
    await account.save();

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Password updated successfully",
      data: null,
    });
  } catch (err) {
    Logger.error({ message: "Error updating password" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error updating password",
      data: null,
    });
  }
};
