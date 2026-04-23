import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { upload } from "../../lib/multer";
import * as ApplicantController from "../../controllers/applicant.Controller";

const router = Router();

// Routes for platform profiles (seeded data)
router.get("/profiles", authenticate(), ApplicantController.getPlatformTalent);

// Routes for job-specific applicants and uploads
router.get("/jobs/:id/applicants", authenticate(), ApplicantController.getJobApplicants);

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
router.post(
  "/jobs/:id/upload/csv",
  authenticate(),
  upload.single("file"),
  ApplicantController.uploadCsv
);

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
router.post(
  "/jobs/:id/upload/pdf",
  authenticate(),
  upload.array("files", 10), // Limit to 10 files per request
  ApplicantController.uploadPdf
);

export default router;
