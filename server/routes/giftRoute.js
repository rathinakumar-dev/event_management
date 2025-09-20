import express from "express";
import { upload, handleMulterError } from "../middleware/upload.js";
import {
  createGift,
  getAllGifts,
  getGiftById,
  updateGift,
  deleteGift,
} from "../controllers/giftController.js";

const router = express.Router();

router.post("/", upload.single("giftImage"), handleMulterError, createGift);
router.get("/", getAllGifts);
router.get("/:id", getGiftById);
router.put("/:id", upload.single("giftImage"), handleMulterError, updateGift);
router.delete("/:id", deleteGift);

export default router;
