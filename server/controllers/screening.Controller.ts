import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import Job from "../models/job.model";
import { UserRole } from "../models/user.model";
import Application from "../models/application.model";
import ScreeningResult from "../models/screening.model";
import ExternalApplicant from "../models/applicant.model";
import { GeminiService } from "../services/gemini.service";
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

    const [pendingExternalCount, successfulExternalCount, failedExternalCount] =
      await Promise.all([
        ExternalApplicant.countDocuments({ jobId, parsingStatus: "pending" }),
        ExternalApplicant.countDocuments({ jobId, parsingStatus: "success" }),
        ExternalApplicant.countDocuments({ jobId, parsingStatus: "failed" }),
      ]);

    if (pendingExternalCount > 0) {
      return res.status(HttpStatusCode.Conflict).json({
        status: "error",
        message: "Resume parsing is still in progress. Please wait before screening.",
        data: {
          pending: pendingExternalCount,
          successful: successfulExternalCount,
          failed: failedExternalCount,
        },
      });
    }

    // 2. Fetch candidates who applied (Platform) and those uploaded (External)
    const [platformApplications, externalApplicants] = await Promise.all([
      Application.find({ jobId }).populate("profileId"), // Get actual applicants
      ExternalApplicant.find({ jobId, parsingStatus: "success" }),
    ]);

    // Map platform applications to standard AI-ready structure
    const platformMapped = platformApplications
      .filter((app) => app.profileId) // Ensure profile exists
      .map((app: any) => ({
        ...app.profileId.toObject(),
        source: "platform",
      }));

    // Map external candidates (from CSV/PDF) to standard AI-ready structure
    const externalMapped = externalApplicants.map((ec) => ({
      _id: ec._id,
      ...ec.parsedProfile,
      source: "external",
    }));

    const allCandidates = [...platformMapped, ...externalMapped];
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
    });
    await screeningRecord.save();

    // 4. Run AI Evaluation 
    try {
      const aiResults = await GeminiService.evaluateCandidates(job, allCandidates);

      // 5. Map AI results back to our schema
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

      res.status(HttpStatusCode.Ok).json({
        status: "success",
        message: "Screening completed successfully",
        data: screeningRecord,
      });
    } catch (aiError) {
      screeningRecord.status = "failed";
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
