import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import User, { UserRole } from "../../models/user.model";
import type { IServerResponse } from "../../types";
import type { Request, Response } from "express";

/**
 * @openapi
 * components:
 *   schemas:
 *     UserList:
 *       type: object
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         totalUsers:
 *           type: integer
 *         page:
 *           type: integer
 */

/**
 * @openapi
 * /api/v1/user/all:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Users found
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
 *                   example: Users found
 *                 data:
 *                   $ref: '#/components/schemas/UserList'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getAllUsers = async (
  req: Request,
  res: Response<IServerResponse>,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find().skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Users found",
      data: {
        users,
        totalUsers,
        page,
      },
    });
  } catch (err) {
    Logger.error({ message: "Error getting all users: " + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error getting all users",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/user/search:
 *   get:
 *     summary: Search for a user by email or id
 *     tags: [Users]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [email, id]
 *         required: true
 *         description: Search type (email or id)
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term
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
export const searchUser = async (
  req: Request,
  res: Response<IServerResponse>,
) => {
  const { type, term } = req.query;
  try {
    if ((type !== "email" && type !== "id") || !term) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Please enter all fields",
        data: null,
      });
    }

    let user;
    if (type === "id") {
      user = await User.findOne({ id: term });
    } else {
      user = await User.findOne({
        $or: [
          { email: { $regex: term, $options: "i" } },
          { name: { $regex: term, $options: "i" } },
        ],
      } as any);
    }

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
    Logger.error({ message: "Error searching user" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error searching user",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/user:
 *   delete:
 *     summary: Delete user
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
 *         description: User deleted successfully
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
 *                   example: User deleted successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export const deleteUser = async (
  req: Request,
  res: Response<IServerResponse>,
) => {
  const { id } = req.query;
  try {
    if (!req.user) {
      return res.status(HttpStatusCode.Unauthorized).json({
        status: "error",
        message: "Authentication required",
        data: null,
      });
    }

    if (req.user.role !== UserRole.ADMIN) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: "error",
        message: "Insufficient permissions",
        data: null,
      });
    }

    if (!id) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Please enter all fields",
        data: null,
      });
    }

    let user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "User not found",
        data: null,
      });
    }

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "User deleted successfully",
      data: null,
    });
  } catch (err) {
    Logger.error({ message: "Error deleting user" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error deleting user",
      data: null,
    });
  }
};
