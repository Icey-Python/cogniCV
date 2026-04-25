import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as OrgController from "../../controllers/organization/org.Controller";

const router = Router();

router.get("/", authenticate(), OrgController.getOrganization);
router.put("/", authenticate(), OrgController.updateOrganization);

export default router;
