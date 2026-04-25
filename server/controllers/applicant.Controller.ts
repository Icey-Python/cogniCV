import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import path from "path";
import fs from "fs";
import Job from "../models/job.model";
import TalentProfile from "../models/talent.model";
import Application from "../models/application.model";
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

const MOCK_TALENT_PATH = path.join(__dirname, "../data/internal-talent.json");

const readMockTalent = (): any[] => {
  const raw = fs.readFileSync(MOCK_TALENT_PATH, "utf-8");
  return JSON.parse(raw);
};

/**
 * @openapi
 * /api/v1/applicants/profiles/mock:
 *   get:
 *     summary: Get all mock talent profiles
 *     tags: [Applicants]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Mock profiles retrieved
 */
export const getMockTalent = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const profiles = readMockTalent();
    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Mock talent profiles retrieved",
      data: profiles,
    });
  } catch (error) {
    Logger.error({ message: "Error reading mock talent: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to read mock talent",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/applicants/profiles/mock/{id}:
 *   get:
 *     summary: Get a single mock talent profile by ID
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
 *         description: Mock profile retrieved
 *       404:
 *         description: Profile not found
 */
export const getMockTalentById = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { id } = req.params;
    const profiles = readMockTalent();
    const profile = profiles.find((p) => p._id === id);

    if (!profile) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "Mock profile not found",
        data: null,
      });
    }

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Mock profile retrieved",
      data: profile,
    });
  } catch (error) {
    Logger.error({ message: "Error reading mock talent by id: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to read mock profile",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/applicants/jobs/{id}/upload/internal:
 *   post:
 *     summary: Import internal talent profiles for a job
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profiles:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Internal profiles imported
 */
export const uploadInternal = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { id: jobId } = req.params;
    const { profiles } = req.body as { profiles: any[] };

    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "profiles array is required",
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

    const saved = await Promise.all(
      profiles.map(async (profile) => {
        // 1. Find or create talent by email
        let talent = await TalentProfile.findOne({ email: profile.email });

        if (talent) {
          // Update existing talent with latest data
          Object.assign(talent, profile, { source: "internal", parsingStatus: "success" });
          await talent.save();
        } else {
          talent = new TalentProfile({
            ...profile,
            source: "internal",
            parsingStatus: "success",
          });
          await talent.save();
        }

        // 2. Link to job if not already linked
        const existingApp = await Application.findOne({
          jobId,
          profileId: talent._id,
        });

        if (!existingApp) {
          const application = new Application({ jobId, profileId: talent._id });
          await application.save();
        }

        return talent;
      })
    );

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: `${saved.length} internal profiles imported`,
      data: { total: saved.length, jobId },
    });
  } catch (error) {
    Logger.error({ message: "Error uploading internal talent: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to import internal profiles",
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

    const applications = await Application.find({ jobId }).populate("profileId");

    const externalApplicants = applications
      .filter((app: any) => app.profileId && app.profileId.source !== "internal")
      .map((app: any) => app.profileId);
      
    const platformTalent = applications
      .filter((app: any) => app.profileId && app.profileId.source === "internal")
      .map((app: any) => app.profileId);

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

    // 2. Save each profile as a TalentProfile and create Application
    const savedApplicants = await Promise.all(
      parsedProfiles.map(async (profile) => {
        // 1. Find or create talent by email
        let talent = await TalentProfile.findOne({ email: profile.email });

        if (talent) {
          // Update existing talent with latest data
          Object.assign(talent, profile, { source: "csv", parsingStatus: "success" });
          await talent.save();
        } else {
          talent = new TalentProfile({
            ...profile,
            source: "csv",
            parsingStatus: "success",
          });
          await talent.save();
        }

        // 2. Link to job if not already linked
        const existingApp = await Application.findOne({
          jobId,
          profileId: talent._id,
        });

        if (!existingApp) {
          const application = new Application({
            jobId,
            profileId: talent._id,
          });
          await application.save();
        }

        return talent;
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
        let talent: InstanceType<typeof TalentProfile> | null = null;

        try {
          // 1. Store original file in Cloudflare R2
          const resumeUrl = await uploadToR2(file.buffer, file.originalname, file.mimetype);

          // 2. Create database record with "pending" status
          talent = new TalentProfile({
            source: "pdf",
            resumeUrl,
            parsingStatus: "pending",
          });
          await talent.save();

          const application = new Application({
            jobId,
            profileId: talent._id,
          });
          await application.save();

          // 3. Publish to RabbitMQ for background AI processing
          await publishToQueue(RabbitMQQueues.RESUME_INGESTION, {
            talentId: talent._id,
            resumeUrl,
            jobId,
          });

          return { name: file.originalname, status: "queued" };
        } catch (error: any) {
          Logger.error({ message: `Failed to queue ${file.originalname}: ${error.message}` });

          if (talent?._id) {
            await TalentProfile.findByIdAndUpdate(talent._id, {
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
