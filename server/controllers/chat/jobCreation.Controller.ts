import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { Logger } from "borgen";
import { GeminiService } from "../../services/gemini.service";
import type { IServerResponse } from "../../types";

/**
 * @openapi
 * /api/v1/chat/job-creation:
 *   post:
 *     summary: Chat endpoint for job creation
 *     description: Analyzes conversation history using AI to collect required fields for job creation. Returns next question or complete job data.
 *     tags:
 *       - Jobs
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *             properties:
 *               messages:
 *                 type: array
 *                 description: Chat conversation history between the user and the assistant.
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI evaluated the chat successfully
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
 *                   example: Chat evaluated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     isComplete:
 *                       type: boolean
 *                       description: Indicates if all required job fields are collected.
 *                     nextQuestion:
 *                       type: string
 *                       description: Next conversational question if isComplete is false.
 *                     jobData:
 *                       type: object
 *                       description: Complete job details if isComplete is true.
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
export const handleJobCreationChat = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { messages, availableLocations, availableDepartments } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Messages array is required",
        data: null,
      });
    }

    const aiResponse = await GeminiService.evaluateJobCreationChat(
      messages,
      availableLocations || [],
      availableDepartments || []
    );

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Chat evaluated successfully",
      data: aiResponse,
    });
  } catch (error) {
    Logger.error({ message: "Error in handleJobCreationChat: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to evaluate chat",
      data: null,
    });
  }
};
