import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { handleJobCreationChat } from "../../controllers/chat/jobCreation.Controller";
import { UserRole } from "../../models/user.model";

const router = Router();

// Endpoint for job creation chat flow.
// Protect this route, for example requiring recruiters/admins if applicable.
// If anyone authenticated can use it, omit the roleRequired.
router.post(
  "/job-creation",
  // authenticate({ roleRequired: [UserRole.ADMIN, UserRole.RECRUITER] }),
  handleJobCreationChat
);

export default router;
