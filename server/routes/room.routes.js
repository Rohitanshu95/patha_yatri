import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { 
  createRoom, 
  listRooms, 
  getRoom, 
  updateRoom, 
  changeRoomStatus, 
  getAvailableRooms 
} from "../controllers/room.controller.js";
import { auditWrite } from "../middleware/auditLogger.js";

const router = express.Router();

const RECEPTIONIST_PLUS = ["receptionist", "manager", "admin"];
const ADMIN_MANAGER = ["admin", "manager"];

router.get(
  "/available",
  authenticate,
  authorize(...RECEPTIONIST_PLUS),
  getAvailableRooms
);
router.get("/", authenticate, authorize(...RECEPTIONIST_PLUS), listRooms);
router.get("/:id", authenticate, authorize(...RECEPTIONIST_PLUS), getRoom);
router.post("/", authenticate, authorize(...ADMIN_MANAGER), upload.array("images", 5), auditWrite("Room"), createRoom);
router.put("/:id", authenticate, authorize(...ADMIN_MANAGER), upload.array("images", 5), auditWrite("Room"), updateRoom);
router.patch(
  "/:id/status",
  authenticate,
  authorize(...RECEPTIONIST_PLUS),
  auditWrite("Room"),
  changeRoomStatus
);

export default router;
