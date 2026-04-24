import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import Job from "../models/job.model";
import TalentProfile from "../models/talent.model";
import ScreeningResult from "../models/screening.model";
import ExternalApplicant from "../models/applicant.model";
import { GeminiService } from "../services/gemini.service";
import type { IServerResponse } from "../types";
import type { Request, Response } from "express";

import Application from "../models/application.model";

/**
 * Trigger AI screening for a job
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

    // 4. Run AI Evaluation (Asynchronous if needed, but for the MVP we can wait or use a background process)
    // For now, let's keep it in the request cycle for easier debugging
    try {
      const aiResults = await GeminiService.evaluateCandidates(job, allCandidates);

      // 5. Map AI results back to our schema
      const rankedCandidates = aiResults.map((result: any) => {
        const candidate = allCandidates.find(
          (c) => c._id.toString() === result.candidateId
        );
        return {
          rank: result.rank,
          candidateId: result.candidateId,
          profileSource: candidate?.source || "platform",
          matchScore: result.matchScore,
          subScores: result.subScores,
          reasoning: result.reasoning,
          profileSnapshot: candidate,
        };
      });

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
 * Get screening results for a job
 */
export const getScreeningResults = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  try {
    const { id: jobId } = req.params;
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
