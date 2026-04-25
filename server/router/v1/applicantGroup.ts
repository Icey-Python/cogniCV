import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { upload } from "../../lib/multer";
import * as ApplicantController from "../../controllers/applicant.Controller";

const router = Router();

router.get("/profiles", authenticate(), ApplicantController.getPlatformTalent);

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

export default router;
