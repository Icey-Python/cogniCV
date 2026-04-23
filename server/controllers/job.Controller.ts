import { Logger } from "borgen";
import { HttpStatusCode } from "axios";
import Job from "../models/job.model";
import { UserRole } from "../models/user.model";
import type { IServerResponse } from "../types";
import type { Request, Response } from "express";

/**
 * @openapi
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         requiredSkills:
 *           type: array
 *           items:
 *             type: string
 *         experienceLevel:
 *           type: string
 *           enum: [Entry, Junior, Mid, Senior, Lead]
 *         type:
 *           type: string
 *           enum: [Full-time, Part-time, Contract]
 *         location:
 *           type: string
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * Create a new job
 */
export const createJob = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { title, description, requiredSkills, experienceLevel, type, location } = req.body;

    if (!title || !description || !experienceLevel || !type || !location) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: "error",
        message: "Missing required job fields",
        data: null,
      });
    }

    const job = new Job({
      title,
      description,
      requiredSkills: requiredSkills || [],
      experienceLevel,
      type,
      location,
      createdBy: req.user._id,
    });

    const savedJob = await job.save();

    res.status(HttpStatusCode.Created).json({
      status: "success",
      message: "Job created successfully",
      data: savedJob,
    });
  } catch (error) {
    Logger.error({ message: "Error creating job: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to create job",
      data: null,
    });
  }
};

/**
 * Get all jobs for the authenticated recruiter
 */
export const getMyJobs = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = req.user.role === UserRole.ADMIN ? {} : { createdBy: req.user._id };

    const [jobs, totalJobs] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(query),
    ]);

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Jobs retrieved successfully",
      data: {
        jobs,
        totalJobs,
        page,
        totalPages: Math.ceil(totalJobs / limit),
      },
    });
  } catch (error) {
    Logger.error({ message: "Error retrieving jobs: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to retrieve jobs",
      data: null,
    });
  }
};

/**
 * Get a single job by ID
 */
export const getJobById = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "Job not found",
        data: null,
      });
    }

    // Check ownership
    if (req.user.role !== UserRole.ADMIN && job.createdBy.toString() !== req.user._id) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: "error",
        message: "Access denied to this job",
        data: null,
      });
    }

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Job retrieved successfully",
      data: job,
    });
  } catch (error) {
    Logger.error({ message: "Error retrieving job: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to retrieve job",
      data: null,
    });
  }
};

/**
 * Update a job
 */
export const updateJob = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "Job not found",
        data: null,
      });
    }

    // Check ownership
    if (req.user.role !== UserRole.ADMIN && job.createdBy.toString() !== req.user._id) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: "error",
        message: "Access denied to update this job",
        data: null,
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updates, { new: true });

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    Logger.error({ message: "Error updating job: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to update job",
      data: null,
    });
  }
};

/**
 * Delete a job
 */
export const deleteJob = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "Job not found",
        data: null,
      });
    }

    // Check ownership
    if (req.user.role !== UserRole.ADMIN && job.createdBy.toString() !== req.user._id) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: "error",
        message: "Access denied to delete this job",
        data: null,
      });
    }

    await Job.findByIdAndDelete(id);

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Job deleted successfully",
      data: null,
    });
  } catch (error) {
    Logger.error({ message: "Error deleting job: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to delete job",
      data: null,
    });
  }
};
