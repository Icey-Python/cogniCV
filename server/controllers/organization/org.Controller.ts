import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import type { Request, Response } from "express";
import Organization from "../../models/organization.model";
import type { IServerResponse } from "../../types";

/**
 * @openapi
 * /api/v1/organization:
 *   get:
 *     summary: Get organization settings
 *     tags: [Organization]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Organization found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getOrganization = async (
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

    let org = await Organization.findOne({ userId });

    // Return empty state if none exists yet
    if (!org) {
      return res.status(HttpStatusCode.Ok).json({
        status: "success",
        message: "No organization settings found",
        data: {
          departments: [],
          locations: [],
        },
      });
    }

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Organization found",
      data: org,
    });
  } catch (err) {
    Logger.error({ message: "Error getting organization" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error getting organization",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/organization:
 *   put:
 *     summary: Update organization settings
 *     tags: [Organization]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departments:
 *                 type: array
 *                 items:
 *                   type: object
 *               locations:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const updateOrganization = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  try {
    const userId = req.user?._id;
    const { departments, locations } = req.body;

    if (!userId) {
      return res.status(HttpStatusCode.Unauthorized).json({
        status: "error",
        message: "Authentication required",
        data: null,
      });
    }

    // Upsert organization for this user
    const updatedOrg = await Organization.findOneAndUpdate(
      { userId },
      {
        userId,
        ...(departments && { departments }),
        ...(locations && { locations }),
      },
      { new: true, upsert: true }
    );

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Organization updated successfully",
      data: updatedOrg,
    });
  } catch (err) {
    Logger.error({ message: "Error updating organization" + err });

    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Error updating organization",
      data: null,
    });
  }
};
