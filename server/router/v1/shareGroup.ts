import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as ShareController from "../../controllers/share.Controller";

const router = Router();

// Route for recruiters to generate a share link (protected)
router.post("/generate", authenticate(), ShareController.createShareLink);

// Route to get the shared analysis (public, but may require password in body)
router.post("/:shareId", ShareController.getSharedAnalysis);

export default router;
