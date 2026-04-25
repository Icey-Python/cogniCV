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
 *           type: object
 *           properties:
 *             country:
 *               type: string
 *             city:
 *               type: string
 *             workspaceType:
 *               type: string
 *             isDefault:
 *               type: boolean
 *         aiFocusArea:
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
 * @openapi
 * /api/v1/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Bad request
 */
export const createJob = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { title, description, requiredSkills, experienceLevel, type, location, aiFocusArea } = req.body;

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
      aiFocusArea,
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
 * @openapi
 * /api/v1/jobs:
 *   get:
 *     summary: Get all jobs for recruiter
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
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
 * @openapi
 * /api/v1/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
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
 *         description: Job retrieved successfully
 *       404:
 *         description: Job not found
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
 * @openapi
 * /api/v1/jobs/{id}:
 *   put:
 *     summary: Update job
 *     tags: [Jobs]
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
 *         description: Job updated successfully
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
 * @openapi
 * /api/v1/jobs/{id}:
 *   delete:
 *     summary: Delete job
 *     tags: [Jobs]
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
 *         description: Job deleted successfully
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

/**
 * @openapi
 * /api/v1/jobs/search:
 *   get:
 *     summary: Search and filter jobs
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (e.g. Active, Closed)
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by source (e.g. Internal, External)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 */
export const searchJobs = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { q, status, source } = req.query;

    const query: any = req.user.role === UserRole.ADMIN ? {} : { createdBy: req.user._id };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = new RegExp(`^${status}$`, 'i');
    }
    
    if (source && source !== 'all') {
      query.source = new RegExp(`^${source}$`, 'i');
    }

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
    Logger.error({ message: "Error searching jobs: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to search jobs",
      data: null,
    });
  }
};

/**
 * @openapi
 * /api/v1/jobs/analytics:
 *   get:
 *     summary: Get dashboard analytics for jobs
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
export const getJobAnalytics = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const query: any = req.user.role === UserRole.ADMIN ? {} : { createdBy: req.user._id };
    
    const activeJobsQuery = { ...query, status: "Active" };
    const activeJobsCount = await Job.countDocuments(activeJobsQuery);

    // Mocking Total Candidates and Avg Match Score for now
    // In the future, this would query the Applicant/Screening models
    const totalCandidates = 42; 
    const avgMatchScore = 83;

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Analytics retrieved successfully",
      data: {
        activeJobs: activeJobsCount,
        totalCandidates,
        avgMatchScore
      },
    });
  } catch (error) {
    Logger.error({ message: "Error retrieving job analytics: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to retrieve job analytics",
      data: null,
    });
  }
};

