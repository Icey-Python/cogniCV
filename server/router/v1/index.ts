import { Router } from "express";
import userGroup from "./userGroup";
import jobGroup from "./jobGroup";
import applicantGroup from "./applicantGroup";
import screeningGroup from "./screeningGroup";
import chatGroup from "./chatGroup";
import organizationGroup from "./organizationGroup";
import { HttpStatusCode } from "axios";

const router = Router();

// Core routes
router.get("/ping", (_, res) => {
  res.status(HttpStatusCode.Ok).json({ message: "pong", alive: true });
});

// Route groups
router.use("/user", userGroup);
router.use("/jobs", jobGroup);
router.use("/applicants", applicantGroup);
router.use("/screening", screeningGroup);
router.use("/chat", chatGroup);
router.use("/organization", organizationGroup);

export default router;
