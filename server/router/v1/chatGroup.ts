import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { handleJobCreationChat } from "../../controllers/chat/jobCreation.Controller";
import { handleJobAnalysisChat, getJobAnalysisStatus } from "../../controllers/chat/ragChat.Controller";
import { UserRole } from "../../models/user.model";

const router = Router();

// Endpoint for job creation chat flow.
router.post(
  "/job-creation",
  // authenticate({ roleRequired: [UserRole.ADMIN, UserRole.RECRUITER] }),
  handleJobCreationChat
);

// RAG-powered job analysis chat
router.post("/job-analysis", authenticate(), handleJobAnalysisChat);
router.get("/job-analysis/:jobId/status", authenticate(), getJobAnalysisStatus);

export default router;
