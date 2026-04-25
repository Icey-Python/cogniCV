import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import bcrypt from "bcrypt";
import Share from "../models/share.model";
import ScreeningResult from "../models/screening.model";
import Job from "../models/job.model";
import type { IServerResponse } from "../types";
import { Logger } from "borgen";

export const createShareLink = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { jobId, candidateId, type, password } = req.body;
    
    let passwordHash;
    if (type === "protected" && password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const share = new Share({
      jobId,
      candidateId,
      type,
      password: passwordHash,
    });
    await share.save();

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Share link generated successfully",
      data: { shareId: share._id },
    });
  } catch (error) {
    Logger.error({ message: "Error generating share link: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to generate share link",
      data: null,
    });
  }
};

export const getSharedAnalysis = async (req: Request, res: Response<IServerResponse>) => {
  try {
    const { shareId } = req.params;
    const { password } = req.body;

    const share = await Share.findById(shareId);
    if (!share) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "Shared analysis not found",
        data: null,
      });
    }

    if (share.type === "protected" && share.password) {
      if (!password) {
        return res.status(HttpStatusCode.Unauthorized).json({
          status: "error",
          message: "Password required",
          data: { requirePassword: true },
        });
      }
      const isMatch = await bcrypt.compare(password, share.password);
      if (!isMatch) {
        return res.status(HttpStatusCode.Unauthorized).json({
          status: "error",
          message: "Invalid password",
          data: null,
        });
      }
    }

    // Get the latest screening result for this job and candidate
    const results = await ScreeningResult.find({ jobId: share.jobId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!results || results.length === 0) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "No screening results found for this job",
        data: null,
      });
    }

    const latestScreening = results[0];
    const candidateData = latestScreening.rankedCandidates.find(
      (c) => c.candidateId.toString() === share.candidateId.toString()
    );

    if (!candidateData) {
      return res.status(HttpStatusCode.NotFound).json({
        status: "error",
        message: "Candidate analysis not found",
        data: null,
      });
    }

    const job = await Job.findById(share.jobId);

    res.status(HttpStatusCode.Ok).json({
      status: "success",
      message: "Shared analysis retrieved",
      data: {
        job,
        candidate: candidateData,
        isProtected: share.type === "protected",
      },
    });
  } catch (error) {
    Logger.error({ message: "Error retrieving shared analysis: " + error });
    res.status(HttpStatusCode.InternalServerError).json({
      status: "error",
      message: "Failed to retrieve shared analysis",
      data: null,
    });
  }
};
