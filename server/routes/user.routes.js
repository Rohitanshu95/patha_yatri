import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { listUsers, createUser, updateUser, deactivateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.get("/", listUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deactivateUser); 

export default router;