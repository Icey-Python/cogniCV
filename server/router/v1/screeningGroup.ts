import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as ScreeningController from "../../controllers/screening.Controller";

const router = Router();

// All screening routes require authentication
router.use(authenticate());

/**
 * @openapi
 * /api/v1/screening/{id}/trigger:
 *   post:
 *     summary: Trigger AI screening for a job
 *     tags: [Screening]
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
 *         description: Screening completed successfully
 */
router.post("/:id/trigger", ScreeningController.triggerScreening);

/**
 * @openapi
 * /api/v1/screening/{id}/results:
 *   get:
 *     summary: Get latest screening results for a job
 *     tags: [Screening]
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
 *         description: Screening results retrieved successfully
 */
router.get("/:id/results", ScreeningController.getScreeningResults);

export default router;
