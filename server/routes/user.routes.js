import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
	listUsers,
	listUserOptions,
	createUser,
	updateUser,
	deactivateUser,
	activateUser,
	resetUserPassword,
} from "../controllers/user.controller.js";
import { auditWrite } from "../middleware/auditLogger.js";
import { validate } from "../middleware/validate.js";
import { userWriteLimiter } from "../middleware/rateLimiter.js";
import {
	listUsersSchema,
	listUserOptionsSchema,
	createUserSchema,
	updateUserSchema,
	userIdParamSchema,
	resetUserPasswordSchema,
} from "../validators/user.validator.js";

const router = express.Router();
const ADMIN_OR_MANAGER = ["admin", "manager"];

router.use(authenticate);

// Lightweight role-filtered list route used by hotel staff selectors
router.get(
	"/options",
	authorize("admin"),
	validate(listUserOptionsSchema),
	listUserOptions
);

router.get(
	"/",
	authorize(...ADMIN_OR_MANAGER),
	validate(listUsersSchema),
	listUsers
);

router.post(
	"/",
	authorize(...ADMIN_OR_MANAGER),
	userWriteLimiter,
	validate(createUserSchema),
	auditWrite("User"),
	createUser
);

router.put(
	"/:id",
	authorize(...ADMIN_OR_MANAGER),
	userWriteLimiter,
	validate(updateUserSchema),
	auditWrite("User"),
	updateUser
);

router.patch(
	"/:id/activate",
	authorize(...ADMIN_OR_MANAGER),
	userWriteLimiter,
	validate(userIdParamSchema),
	auditWrite("User"),
	activateUser
);

router.patch(
	"/:id/password",
	authorize("admin"),
	userWriteLimiter,
	validate(resetUserPasswordSchema),
	auditWrite("User"),
	resetUserPassword
);

router.delete(
	"/:id",
	authorize(...ADMIN_OR_MANAGER),
	userWriteLimiter,
	validate(userIdParamSchema),
	auditWrite("User"),
	deactivateUser
);

export default router;