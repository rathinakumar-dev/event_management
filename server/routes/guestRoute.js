import express from "express";
import {
  registerGuest,
  getAllGuests,
  getVerifiedGuests,
  verifyOtp,
  updateGuest,
  deleteGuest,
} from "../controllers/guestController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerGuest);
router.get("/", getAllGuests);
router.get("/verified", verifyToken, getVerifiedGuests);
router.post("/verify-otp", verifyOtp);
router.put("/:id", updateGuest);
router.delete("/:id", deleteGuest);

export default router;
