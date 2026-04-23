import { Router } from "express";
import userGroup from "./userGroup";
import jobGroup from "./jobGroup";
import { HttpStatusCode } from "axios";

const router = Router();

// Core routes
router.get("/ping", (_, res) => {
  res.status(HttpStatusCode.Ok).json({ message: "pong", alive: true });
});

// Route groups
router.use("/user", userGroup);
router.use("/jobs", jobGroup);

export default router;
