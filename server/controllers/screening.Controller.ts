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
import { json2csv } from "json-2-csv";

const applyFiltersToCandidates = (candidates: any[], query: any) => {
  const { location, skills, experience, education, limit } = query;
  let filtered = [...candidates];

  if (location) {
    const locRegex = new RegExp(location as string, "i");
    filtered = filtered.filter(c => c.profileSnapshot?.location && locRegex.test(c.profileSnapshot.location));
  }

  if (skills) {
    const skillList = (skills as string).split(',').map(s => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      filtered = filtered.filter(c => {
        const candidateSkills = c.profileSnapshot?.skills || [];
        return skillList.some(skill => {
          const skillRegex = new RegExp(skill, "i");
          return candidateSkills.some((cs: any) => skillRegex.test(cs.name));
        });
      });
    }
  }

  if (education) {
    const eduMap: Record<string, string> = {
      bsc: "bsc|bachelor|b\\.s|bs",
      msc: "msc|master|m\\.s|ms",
      phd: "phd|doctorate",
    };
    const eduTerm = (education as string).toLowerCase();
    const pattern = eduMap[eduTerm] || eduTerm;
    const eduRegex = new RegExp(pattern, "i");
    
    filtered = filtered.filter(c => {
      const candidateEducation = c.profileSnapshot?.education || [];
      return candidateEducation.some((ce: any) => 
        eduRegex.test(ce.degree || "") || eduRegex.test(ce.fieldOfStudy || "")
      );
    });
  }

  if (experience) {
    const minYears = Number(experience);
    if (!isNaN(minYears)) {
      filtered = filtered.filter(c => {
        const maxSkillYears = c.profileSnapshot?.skills?.reduce((max: number, s: any) => Math.max(max, s.yearsOfExperience || 0), 0) || 0;
        
        let expYears = 0;
        const exps = c.profileSnapshot?.experience || [];
        if (exps.length > 0) {
          try {
            let minYear = 9999;
            let maxYear = 0;
            exps.forEach((exp: any) => {
              const start = exp.startDate ? new Date(exp.startDate).getFullYear() : null;
              const end = exp.isCurrent ? new Date().getFullYear() : (exp.endDate ? new Date(exp.endDate).getFullYear() : null);
              if (start && !isNaN(start)) minYear = Math.min(minYear, start);
              if (end && !isNaN(end)) maxYear = Math.max(maxYear, end);
            });
            if (minYear !== 9999 && maxYear !== 0 && maxYear >= minYear) {
              expYears = maxYear - minYear;
            }
          } catch(e) {}
        }
        
        const totalYears = Math.max(maxSkillYears, expYears);
        return totalYears >= minYears;
      });
    }
  }

  const finalLimit = limit ? Number(limit) : filtered.length;
  return filtered.slice(0, finalLimit);
};

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

    const latestResult = results[0].toObject();
    
    if (Object.keys(req.query).length > 0) {
      latestResult.rankedCandidates = applyFiltersToCandidates(latestResult.rankedCandidates, req.query);
    }

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Screening results retrieved successfully",
      data: latestResult,
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

/**
 * @openapi
 * /api/v1/screening/{id}/download:
 *   get:
 *     summary: Download candidate analysis as CSV
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
 *         description: CSV file downloaded successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
export const downloadScreeningCsv = async (
  req: Request,
  res: Response
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
        message: "Access denied",
        data: null,
      });
    }

    const results = await ScreeningResult.find({ jobId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!results || results.length === 0 || results[0].status !== "completed") {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "No completed screening results found for this job",
        data: null,
      });
    }

    let candidates = results[0].toObject().rankedCandidates;
    
    // Rank, Name, Overal Score, Location, Skill Score, Experience Score, Education Score, Relevance Score
    const csvData = candidates.map(c => {
      const p = c.profileSnapshot || {};
      const name = `${p.firstName || ''} ${p.lastName || ''}`.trim();
      return {
        "Rank": c.rank || 0,
        "Name": name || p.email || 'Unknown',
        "Overall Score": c.matchScore || 0,
        "Location": p.location || '',
        "Skill Score": c.subScores?.skills || 0,
        "Experience Score": c.subScores?.experience || 0,
        "Education Score": c.subScores?.education || 0,
        "Relevance Score": c.subScores?.relevance || 0,
      };
    });

    if (csvData.length === 0) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "No candidates found in analysis",
        data: null,
      });
    }

    const csvString = await json2csv(csvData, {
      keys: ["Rank", "Name", "Overall Score", "Location", "Skill Score", "Experience Score", "Education Score", "Relevance Score"]
    });

    const fileName = job.title.toLowerCase().replace(/\s+/g, '_') + '_analysis.csv';

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(HttpStatusCode.Ok).send(csvString);
  } catch (error) {
    Logger.error({ message: "Error generating CSV: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to generate CSV",
      data: null,
    });
  }
};
