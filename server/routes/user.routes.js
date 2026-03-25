import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { listUsers, createUser, updateUser, deactivateUser } from "../controllers/user.controller.js";
import { auditWrite } from "../middleware/auditLogger.js";

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.get("/", listUsers);
router.post("/", auditWrite("User"), createUser);
router.put("/:id", auditWrite("User"), updateUser);
router.delete("/:id", auditWrite("User"), deactivateUser); 

export default router;