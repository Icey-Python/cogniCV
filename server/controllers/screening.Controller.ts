import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import Job from "../models/job.model";
import { UserRole } from "../models/user.model";
import Application from "../models/application.model";
import ScreeningResult from "../models/screening.model";
import TalentProfile from "../models/talent.model";
import { GeminiService } from "../services/gemini.service";
import { publishToQueue, RabbitMQQueues } from "../lib/rabbitmq";
import type { IServerResponse } from "../types";
import type { Request, Response } from "express";

/**
 * @openapi
 * components:
 *   schemas:
 *     ScreeningResult:
 *       type: object
 *       properties:
 *         jobId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *         rankedCandidates:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rank:
 *                 type: integer
 *               candidateId:
 *                 type: string
 *               matchScore:
 *                 type: number
 *               reasoning:
 *                 type: object
 *                 properties:
 *                   recommendation:
 *                     type: string
 */

/**
 * @openapi
 * /api/v1/screening/{id}/trigger:
 *   post:
 *     summary: Trigger AI screening for a job
 *     tags: [Screening]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Screening completed successfully
 */
export const triggerScreening = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  try {
    const { id: jobId } = req.params;

    // 1. Fetch Job
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
        message: "Access denied to screen this job",
        data: null,
      });
    }

    const applications = await Application.find({ jobId }).populate("profileId");

    const allCandidates = applications
      .filter((app: any) => app.profileId)
      .map((app: any) => ({
        _id: app.profileId._id,
        ...app.profileId.toObject(),
        source: app.profileId.source,
      }));

    const pendingCount = allCandidates.filter(c => c.parsingStatus === "pending").length;
    const successfulCount = allCandidates.filter(c => c.parsingStatus === "success").length;
    const failedCount = allCandidates.filter(c => c.parsingStatus === "failed").length;

    if (pendingCount > 0) {
      return res.status(HttpStatusCode.Conflict).json({
        status: "error",
        message: "Resume parsing is still in progress. Please wait before screening.",
        data: {
          pending: pendingCount,
          successful: successfulCount,
          failed: failedCount,
        },
      });
    }

    const candidateById = new Map(
      allCandidates.map((candidate: any) => [candidate._id.toString(), candidate])
    );

    if (allCandidates.length === 0) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "No applicants found for this job",
        data: null,
      });
    }

    // 3. Create a pending screening result
    const screeningRecord = new ScreeningResult({
      jobId,
      status: "pending",
      rankedCandidates: [],
      totalCandidates: allCandidates.length,
    });
    await screeningRecord.save();

    // 4. Run AI Evaluation 
    try {
      const aiResults = await GeminiService.evaluateCandidates(
        job, 
        allCandidates,
        async (currentAiResults) => {
          // Map partial results back to our schema
          const partialRanked = currentAiResults
            .map((result: any) => {
              const candidate = candidateById.get(String(result.candidateId));
              if (!candidate) return null;

              return {
                rank: result.rank || 0, // Rank might not be final yet
                candidateId: candidate._id,
                profileSource: candidate.source,
                matchScore: result.matchScore,
                subScores: result.subScores,
                reasoning: result.reasoning,
                profileSnapshot: candidate,
              };
            })
            .filter((result): result is NonNullable<typeof result> => result !== null);

          // Update the screening record with partial results
          await ScreeningResult.findByIdAndUpdate(screeningRecord._id, {
            rankedCandidates: partialRanked
          });
        }
      );

      // 5. Map final AI results back to our schema
      const rankedCandidates = aiResults
        .map((result: any) => {
        const candidate = candidateById.get(String(result.candidateId));
        if (!candidate) return null;

        return {
          rank: result.rank,
          candidateId: candidate._id,
          profileSource: candidate.source,
          matchScore: result.matchScore,
          subScores: result.subScores,
          reasoning: result.reasoning,
          profileSnapshot: candidate,
        };
        })
        .filter((result): result is NonNullable<typeof result> => result !== null);

      const screenedCandidateIds = new Set(
        rankedCandidates.map((candidate) => candidate.candidateId.toString())
      );

      if (
        rankedCandidates.length !== allCandidates.length ||
        screenedCandidateIds.size !== allCandidates.length
      ) {
        throw new Error(
          `AI returned incomplete or invalid candidate results. Expected ${allCandidates.length}, got ${rankedCandidates.length}.`
        );
      }

      // 6. Finalize the screening result
      screeningRecord.rankedCandidates = rankedCandidates;
      screeningRecord.status = "completed";
      await screeningRecord.save();

      // 7. Queue embedding generation for RAG chat (non-blocking)
      try {
        await publishToQueue(RabbitMQQueues.EMBEDDING_GENERATION, { jobId });
        Logger.info({ message: `Queued embedding generation for job ${jobId}` });
      } catch (embErr) {
        // Non-critical: screening still succeeds even if embedding queue fails
        Logger.warn({ message: "Failed to queue embedding generation: " + embErr });
      }

      res.status(HttpStatusCode.Ok).json({
        status: "success",
        message: "Screening completed successfully",
        data: screeningRecord,
      });
    } catch (aiError) {
      // Clear partial results if the whole process fails
      screeningRecord.status = "failed";
      screeningRecord.rankedCandidates = [];
      screeningRecord.error = (aiError as Error).message;
      await screeningRecord.save();
      throw aiError;
    }
  } catch (error) {
    Logger.error({ message: "Error in screening: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Screening process failed",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/screening/{id}/results:
 *   get:
 *     summary: Get latest screening results for a job
 *     tags: [Screening]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Screening results retrieved successfully
 */
export const getScreeningResults = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  try {
    const { id: jobId } = req.params;
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
        message: "Access denied to view screening results for this job",
        data: null,
      });
    }

    const results = await ScreeningResult.find({ jobId })
      .sort({ createdAt: -1 })
      .limit(1); // Get the latest run

    if (!results || results.length === 0) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "No screening results found for this job",
        data: null,
      });
    }

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Screening results retrieved successfully",
      data: results[0],
    });
  } catch (error) {
    Logger.error({ message: "Error fetching results: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to fetch results",
      data: null,
    });
  }
};
