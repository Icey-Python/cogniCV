import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import Job from "../models/job.model";
import TalentProfile from "../models/talent.model";
import Application from "../models/application.model";
import ExternalApplicant from "../models/applicant.model";
import { ParserService } from "../services/parser.service";
import type { IServerResponse } from "../types";
import type { Request, Response } from "express";

/**
 * @openapi
 * components:
 *   schemas:
 *     TalentProfile:
 *       type: object
 *       properties:
 *         headline:
 *           type: string
 *         bio:
 *           type: string
 *         location:
 *           type: string
 *         skills:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced, Expert]
 *               yearsOfExperience:
 *                 type: number
 *         experience:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *               role:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               isCurrent:
 *                 type: boolean
 *         availability:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: ["Available", "Open to Opportunities", "Not Available"]
 *             type:
 *               type: string
 *               enum: ["Full-time", "Part-time", "Contract"]
 */

/**
 * @openapi
 * /api/v1/applicants/profiles:
 *   get:
 *     summary: Get platform talent profiles
 *     tags: [Applicants]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profiles retrieved
 */
export const getPlatformTalent = async (
  req: Request,
  res: Response<IServerResponse>
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      TalentProfile.find().skip(skip).limit(limit),
      TalentProfile.countDocuments(),
    ]);

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Profiles retrieved successfully",
      data: {
        profiles,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    Logger.error({ message: "Error fetching platform talent: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to fetch platform talent",
      data: null,
    });
  }
};


/**
 * @openapi
 * /api/v1/applicants/jobs/{id}/applicants:
 *   get:
 *     summary: Get all applicants for a job
 *     tags: [Applicants]
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
 *         description: Applicants retrieved
 */
export const getJobApplicants = async (
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

    // 1. Fetch Platform Applicants (Linked via Application model)
    const platformApplications = await Application.find({ jobId }).populate("profileId");
    const platformTalent = platformApplications
      .filter((app) => app.profileId)
      .map((app) => app.profileId);

    // 2. Fetch External Applicants (Uploaded specifically for this job)
    const externalApplicants = await ExternalApplicant.find({ jobId });

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Applicants retrieved successfully",
      data: {
        external: externalApplicants,
        platform: platformTalent,
      },
    });
  } catch (error) {
    Logger.error({ message: "Error fetching job applicants: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to fetch applicants",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/applicants/jobs/{id}/upload/csv:
 *   post:
 *     summary: Upload CSV or Excel file for a job
 *     tags: [Applicants]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202:
 *         description: File accepted for processing
 */
export const uploadCsv = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { id: jobId } = req.params;
    const file = req.file as Express.Multer.File;

    if (!file) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "No file uploaded",
        data: null,
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "Job not found",
        data: null,
      });
    }

    Logger.info({ message: `Parsing spreadsheet: ${file.originalname}` });

    // 1. Parse Spreadsheet via AI
    const parsedProfiles = await ParserService.parseSpreadsheet(file.buffer);

    // 2. Save each profile as an ExternalApplicant
    const savedApplicants = await Promise.all(
      parsedProfiles.map(async (profile) => {
        const applicant = new ExternalApplicant({
          jobId,
          source: "csv",
          parsedProfile: profile,
          parsingStatus: "success",
        });
        return await applicant.save();
      })
    );

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: `${savedApplicants.length} applicants imported from spreadsheet`,
      data: {
        total: savedApplicants.length,
        jobId,
      },
    });
  } catch (error) {
    Logger.error({ message: "Error uploading CSV: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to process spreadsheet",
      data: null,
    });
  }
};

import { publishToQueue, RabbitMQQueues } from "../lib/rabbitmq";
import { uploadToR2 } from "../lib/r2";

/**
 * @openapi
 * /api/v1/applicants/jobs/{id}/upload/pdf:
 *   post:
 *     summary: Upload multiple PDF resumes for a job
 *     tags: [Applicants]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       202:
 *         description: Files accepted for processing
 */
export const uploadPdf = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { id: jobId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "No files uploaded",
        data: null,
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "Job not found",
        data: null,
      });
    }

    Logger.info({ message: `Received ${files.length} resumes. Initiating R2 upload and queuing...` });

    // Step 1 & 2: Upload to R2 and create Pending records in parallel
    const queueResults = await Promise.allSettled(
      files.map(async (file) => {
        let applicant: InstanceType<typeof ExternalApplicant> | null = null;

        try {
          // 1. Store original file in Cloudflare R2
          const resumeUrl = await uploadToR2(file.buffer, file.originalname, file.mimetype);

          // 2. Create database record with "pending" status
          applicant = new ExternalApplicant({
            jobId,
            source: "pdf",
            resumeUrl,
            parsingStatus: "pending",
          });
          await applicant.save();

          // 3. Publish to RabbitMQ for background AI processing
          await publishToQueue(RabbitMQQueues.RESUME_INGESTION, {
            applicantId: applicant._id,
            resumeUrl,
            jobId,
          });

          return { name: file.originalname, status: "queued" };
        } catch (error: any) {
          Logger.error({ message: `Failed to queue ${file.originalname}: ${error.message}` });

          if (applicant?._id) {
            await ExternalApplicant.findByIdAndUpdate(applicant._id, {
              parsingStatus: "failed",
              errorMessage: "Failed to queue resume for parsing: " + error.message,
            });
          }

          throw error;
        }
      })
    );

    // Step 3: Return 202 Accepted immediately
    res.status(HttpStatusCode.Accepted).json({
      status: "success",
      message: "Resumes accepted and queued for processing",
      data: {
        total: files.length,
        queued: queueResults.filter((r) => r.status === "fulfilled").length,
        failed: queueResults.filter((r) => r.status === "rejected").length,
      },
    });
  } catch (error) {
    Logger.error({ message: "Critical error in uploadPdf: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to initiate upload pipeline",
      data: null,
    });
  }
};
