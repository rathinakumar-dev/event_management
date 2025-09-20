import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  updateEventStatus, 
  getPublicEvent,
  getActiveEventsByAgent,
  deleteEvent,
} from "../controllers/eventController.js";
import { upload } from "../middleware/upload.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, upload.single("welcomeImage"), createEvent);
router.get("/", verifyToken, getAllEvents);
router.put("/:id/status", verifyToken, updateEventStatus);  
router.get("/public/:id", getPublicEvent); 
router.get("/active/:agentId",verifyToken, getActiveEventsByAgent);
router.get("/:id", verifyToken, getEventById);
router.put("/:id", verifyToken, upload.single("welcomeImage"), updateEvent);
router.delete("/:id", verifyToken, deleteEvent);


export default router;
