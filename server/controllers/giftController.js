import Gift from "../models/Gift.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CREATE GIFT
export const createGift = async (req, res) => {
  try {
    const { giftName } = req.body;
    if (!giftName)
      return res
        .status(400)
        .json({ success: false, message: "giftName is required" });
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "giftImage is required" });

    const publicPath = `/uploads/gifts/${req.file.filename}`;

    const gift = await Gift.create({
      giftName,
      giftImage: publicPath,
    });

    return res
      .status(201)
      .json({ success: true, message: "Gift created", data: gift });
  } catch (error) {
    if (req.file?.path)
      fs.existsSync(req.file.path) && fs.unlink(req.file.path, () => {});
    return res
      .status(500)
      .json({
        success: false,
        message: "Error creating gift",
        error: error.message,
      });
  }
};

//GET ALL GIFTS
export const getAllGifts = async (req, res) => {
  try {
    const gifts = await Gift.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ success: true, count: gifts.length, data: gifts });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching gifts",
        error: error.message,
      });
  }
};

//GET GIFTS BY ID
export const getGiftById = async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.id);
    if (!gift)
      return res
        .status(404)
        .json({ success: false, message: "Gift not found" });
    return res.status(200).json({ success: true, data: gift });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching gift",
        error: error.message,
      });
  }
};

// UPDATE GIFT
export const updateGift = async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.id);
    if (!gift) {
      if (req.file?.path)
        fs.existsSync(req.file.path) && fs.unlink(req.file.path, () => {});
      return res
        .status(404)
        .json({ success: false, message: "Gift not found" });
    }

    if (typeof req.body.giftName === "string" && req.body.giftName.trim()) {
      gift.giftName = req.body.giftName.trim();
    }

    if (req.file) {
      const oldPath = path.join(__dirname, "..", gift.giftImage);
      if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      gift.giftImage = `/uploads/gifts/${req.file.filename}`;
    }

    const updated = await gift.save();
    return res
      .status(200)
      .json({ success: true, message: "Gift updated", data: updated });
  } catch (error) {
    if (req.file?.path)
      fs.existsSync(req.file.path) && fs.unlink(req.file.path, () => {});
    return res
      .status(500)
      .json({
        success: false,
        message: "Error updating gift",
        error: error.message,
      });
  }
};

// DELETE GIFT
export const deleteGift = async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.id);
    if (!gift)
      return res
        .status(404)
        .json({ success: false, message: "Gift not found" });

    const imgAbsPath = path.join(__dirname, "..", gift.giftImage);
    if (fs.existsSync(imgAbsPath)) fs.unlink(imgAbsPath, () => {});
    await Gift.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Gift deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error deleting gift",
        error: error.message,
      });
  }
};
