import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import Job from "../models/job.model";
import TalentProfile from "../models/talent.model";
import ExternalApplicant from "../models/applicant.model";
import type { IServerResponse } from "../types";
import type { Request, Response } from "express";

/**
 * Get all internal platform talent profiles (seeded data)
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
 * Get all applicants for a specific job (Unified: Internal + External)
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

    // For now, we return external applicants associated with this job
    // and a sample of platform talent as potential applicants
    const externalApplicants = await ExternalApplicant.find({ jobId });
    const platformTalent = await TalentProfile.find().limit(10); // Placeholder for internal matching

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
 * Upload and process CSV/Excel for a job
 */
export const uploadCsv = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { id: jobId } = req.params;
    if (!req.file) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "No file uploaded",
        data: null,
      });
    }

    // Logic for CSV/Excel parsing will go here in the next step
    // For now, we acknowledge receipt
    res.status(HttpStatusCode.Accepted).json({
      status: "success",
      message: "File received and queued for processing",
      data: {
        fileName: req.file.originalname,
        jobId,
      },
    });
  } catch (error) {
    Logger.error({ message: "Error uploading CSV: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to upload file",
      data: null,
    });
  }
};

/**
 * Upload and process PDF resumes for a job
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

    // Logic for PDF parsing will go here in the next step
    res.status(HttpStatusCode.Accepted).json({
      status: "success",
      message: `${files.length} files received and queued for processing`,
      data: {
        count: files.length,
        jobId,
      },
    });
  } catch (error) {
    Logger.error({ message: "Error uploading PDFs: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to upload files",
      data: null,
    });
  }
};
