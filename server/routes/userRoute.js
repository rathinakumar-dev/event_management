import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  deleteUser,
  getProfile,
  getUsers,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", verifyToken, verifyRole("admin"), getUsers);
router.delete("/:id", verifyToken, verifyRole("admin"), deleteUser);
router.get("/me", verifyToken, getProfile);
router.put("/:id", verifyToken, verifyRole("admin"), updateUser);

export default router;
