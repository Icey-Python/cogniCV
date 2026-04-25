import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { UserRole } from "../../models/user.model";
import * as AuthController from "../../controllers/user/auth.Controller";
import * as ProfileController from "../../controllers/user/profile.Controller";
import * as ManagementController from "../../controllers/user/management.Controller";

const router = Router();

// Authentication routes
router.post("/", AuthController.createUser);
router.post("/login", AuthController.loginUser);
router.get("/logout", AuthController.logoutUser);

// Profile routes
router.get("/me", authenticate(), ProfileController.getLoggedInUser);
router.get(
  "/",
  authenticate({ roleRequired: UserRole.ADMIN }),
  ProfileController.getUser,
);
router.put("/", authenticate(), ProfileController.updateUser);
router.put("/phone", authenticate(), ProfileController.updateUserPhone);
router.put("/password", authenticate(), ProfileController.updatePassword);

// Admin Management routes
router.get(
  "/all",
  authenticate({ roleRequired: UserRole.ADMIN }),
  ManagementController.getAllUsers,
);
router.delete(
  "/",
  authenticate({ roleRequired: UserRole.ADMIN }),
  ManagementController.deleteUser,
);
router.get(
  "/search",
  authenticate({ roleRequired: UserRole.ADMIN }),
  ManagementController.searchUser,
);

export default router;
