import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { upload } from "../../lib/multer";
import * as ApplicantController from "../../controllers/applicant.Controller";

const router = Router();

router.get("/profiles", authenticate(), ApplicantController.getPlatformTalent);

router.get("/profiles/mock", authenticate(), ApplicantController.getMockTalent);

router.get("/profiles/mock/:id", authenticate(), ApplicantController.getMockTalentById);

router.post("/jobs/:id/upload/internal", authenticate(), ApplicantController.uploadInternal);

router.get("/jobs/:id/applicants", authenticate(), ApplicantController.getJobApplicants);

router.post(
  "/jobs/:id/upload/csv",
  authenticate(),
  upload.single("file"),
  ApplicantController.uploadCsv
);

router.post(
  "/jobs/:id/upload/pdf",
  authenticate(),
  upload.array("files", 10), // Limit to 10 files per request
  ApplicantController.uploadPdf
);

router.post(
  "/jobs/:id/applicants/:applicantId/generate-response",
  authenticate(),
  ApplicantController.generateResponse
);

router.post(
  "/jobs/:id/applicants/:applicantId/send-email",
  authenticate(),
  ApplicantController.sendResponseEmail
);

export default router;
