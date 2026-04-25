import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as ScreeningController from "../../controllers/screening.Controller";

const router = Router();

// All screening routes require authentication
router.use(authenticate());

router.post("/:id/trigger", ScreeningController.triggerScreening);

router.get("/:id/results", ScreeningController.getScreeningResults);

export default router;
