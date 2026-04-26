import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { handleJobCreationChat } from "../../controllers/chat/jobCreation.Controller";
import { handleJobAnalysisChat, getJobAnalysisStatus, triggerJobIndexing } from "../../controllers/chat/ragChat.Controller";
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
router.post("/job-analysis/:jobId/trigger-indexing", authenticate(), triggerJobIndexing);

export default router;
