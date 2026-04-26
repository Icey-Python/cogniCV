import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import Job from "../../models/job.model";
import { UserRole } from "../../models/user.model";
import ScreeningResult from "../../models/screening.model";
import { ChromaService } from "../../services/chroma.service";
import { publishToQueue, RabbitMQQueues } from "../../lib/rabbitmq";
import type { IServerResponse } from "../../types";
import type { Request, Response } from "express";

/**
 * @openapi
 * /api/v1/chat/job-analysis:
 *   post:
 *     summary: Ask a question about a job's screening results (RAG chat)
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId, question]
 *             properties:
 *               jobId:
 *                 type: string
 *               question:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI-generated answer based on screening analysis
 */
export const handleJobAnalysisChat = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  try {
    const { jobId, question, history = [] } = req.body;

    if (!jobId || !question) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "jobId and question are required",
        data: null,
      });
    }

    // Verify user has access to this job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "Job not found",
        data: null,
      });
    }

    if (req.user.role !== UserRole.ADMIN && job.createdBy.toString() !== req.user._id) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: "error",
        message: "Access denied",
        data: null,
      });
    }

    // Query the RAG system
    const answer = await ChromaService.queryJobAnalysis(jobId, question, history);

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Answer generated successfully",
      data: { answer },
    });
  } catch (error) {
    Logger.error({ message: "Error in job analysis chat: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to generate answer",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/chat/job-analysis/{jobId}/status:
 *   get:
 *     summary: Check if a job's analysis has been indexed for RAG chat
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Index status
 */
export const getJobAnalysisStatus = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  try {
    const { jobId } = req.params as { jobId: string };

    const ready = await ChromaService.isJobIndexed(jobId);

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: ready ? "Index is ready" : "Index not yet available",
      data: { ready },
    });
  } catch (error) {
    Logger.error({ message: "Error checking analysis status: " + error });
    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Index not yet available",
      data: { ready: false },
    });
  }
};

/**
 * @openapi
 * /api/v1/chat/job-analysis/{jobId}/trigger-indexing:
 *   post:
 *     summary: Trigger on-demand embedding generation for a job's screening results
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Indexing triggered or already available
 */
export const triggerJobIndexing = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  try {
    const { jobId } = req.params as { jobId: string };

    // 1. Verify job exists and user has access
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "Job not found",
        data: null,
      });
    }

    if (req.user.role !== UserRole.ADMIN && job.createdBy.toString() !== req.user._id) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: "error",
        message: "Access denied",
        data: null,
      });
    }

    // 2. Check if a completed screening exists
    const screening = await ScreeningResult.findOne({ jobId, status: "completed" })
      .sort({ createdAt: -1 });

    if (!screening) {
      return res.status(HttpStatusCode.Ok).json({
        status: "success",
        message: "No completed screening found for this job",
        data: { triggered: false, reason: "no_screening" },
      });
    }

    // 3. Check if already indexed
    const alreadyIndexed = await ChromaService.isJobIndexed(jobId);
    if (alreadyIndexed) {
      return res.status(HttpStatusCode.Ok).json({
        status: "success",
        message: "Index is already available",
        data: { triggered: false, reason: "already_indexed" },
      });
    }

    // 4. Trigger embedding generation via the existing RabbitMQ worker pipeline
    await publishToQueue(RabbitMQQueues.EMBEDDING_GENERATION, { jobId });
    Logger.info({ message: `On-demand embedding generation queued for job ${jobId}` });

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Embedding generation triggered",
      data: { triggered: true },
    });
  } catch (error) {
    Logger.error({ message: "Error triggering job indexing: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to trigger indexing",
      data: null,
    });
  }
};
