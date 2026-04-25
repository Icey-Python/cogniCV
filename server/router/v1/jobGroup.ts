import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as JobController from "../../controllers/job.Controller";

const router = Router();

// All job routes require authentication
router.use(authenticate());

router.post("/", JobController.createJob);

router.get("/", JobController.getMyJobs);

router.get("/search", JobController.searchJobs);

router.get("/analytics", JobController.getJobAnalytics);

router.get("/:id", JobController.getJobById);

router.put("/:id", JobController.updateJob);

router.delete("/:id", JobController.deleteJob);

export default router;
