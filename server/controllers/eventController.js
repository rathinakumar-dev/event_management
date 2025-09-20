import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Event from "../models/Event.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseGifts = (giftsRaw) => {
  if (!giftsRaw) return [];
  if (Array.isArray(giftsRaw)) return giftsRaw;
  if (typeof giftsRaw === "string") {
    // Try JSON first, then comma-split fallback
    try {
      const parsed = JSON.parse(giftsRaw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // ignore
    }
    return giftsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const parseDate = (dateRaw) => {
  if (!dateRaw) return null;
  // Accept YYYY-MM-DD or ISO strings
  const d = new Date(dateRaw);
  if (isNaN(d)) return null;
  return d;
};

// CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      contactPerson,
      contactNo,
      functionName,
      functionType,
      relationEnabled,
      brideName,
      groomName,
      agentId,
      status,
    } = req.body;

    // parse gifts (support array, JSON-string, comma string)
    const gifts = parseGifts(req.body.gifts);

    // parse eventDate (required)
    const parsedDate = parseDate(req.body.eventDate);
    if (!parsedDate) {
      return res
        .status(400)
        .json({
          message:
            "eventDate is required and must be a valid date (YYYY-MM-DD)",
        });
    }

    // Store welcome image path if file uploaded
    const welcomeImage = req.file ? `/uploads/gifts/${req.file.filename}` : "";

    const newEvent = new Event({
      eventName,
      contactPerson,
      contactNo,
      functionName,
      functionType,
      relationEnabled: relationEnabled === "true" || relationEnabled === true,
      brideName,
      groomName,
      agentId,
      gifts,
      welcomeImage,
      status: status || "pending",
      eventDate: parsedDate,
    });

    const savedEvent = await newEvent.save();

    // generate guestFormUrl (frontend url from env)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const guestFormUrl = `${frontendUrl}/guest_form/${savedEvent._id}`;

    // update savedEvent with guestFormUrl
    savedEvent.guestFormUrl = guestFormUrl;
    await savedEvent.save();

    const populatedEvent = await Event.findById(savedEvent._id)
      .populate("gifts", "giftName giftImage")
      .populate("agentId", "name username");

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error("createEvent error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// GET ALL EVENTS
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("gifts", "giftName giftImage")
      .populate("agentId", "name username");

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE EVENT
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("gifts", "giftName giftImage")
      .populate("agentId", "name username");

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET PUBLIC EVENT MINIMAL DATA
export const getPublicEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .select("eventName eventDate gifts agentId status welcomeImage")
      .populate("gifts", "giftName giftImage")
      .populate("agentId", "name");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Status handling
    if (event.status === "pending") {
      return res.status(403).json({ message: "Event is not active yet" });
    }

    if (event.status === "completed") {
      return res.status(200).json({
        ...event.toObject(),
        message: "Gift selection completed",
      });
    }

    // Active event → return normally
    res.status(200).json(event);
  } catch (error) {
    console.error("getPublicEvent error:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const updatedData = { ...req.body };

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // never allow status change via this endpoint (we have separate route)
    delete updatedData.status;

    // parse gifts if present
    if (updatedData.gifts) {
      updatedData.gifts = parseGifts(updatedData.gifts);
    }

    // parse eventDate if present
    if (updatedData.eventDate) {
      const parsed = parseDate(updatedData.eventDate);
      if (!parsed) {
        return res.status(400).json({ message: "Invalid eventDate format" });
      }
      updatedData.eventDate = parsed;
    }

    // handle welcome image replacement
    if (req.file) {
      if (event.welcomeImage) {
        const oldImagePath = path.join(__dirname, "..", event.welcomeImage);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      updatedData.welcomeImage = `/uploads/gifts/${req.file.filename}`;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    )
      .populate("gifts", "giftName giftImage")
      .populate("agentId", "name username");

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("updateEvent error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.welcomeImage) {
      const imgAbsPath = path.join(__dirname, "..", event.welcomeImage);
      if (fs.existsSync(imgAbsPath)) fs.unlinkSync(imgAbsPath);
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("deleteEvent error:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE STATUS ONLY
export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "active", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const event = await Event.findByIdAndUpdate(id, { status }, { new: true })
      .populate("gifts", "giftName giftImage")
      .populate("agentId", "name username");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// AGENT GET ACTIVE EVENTS
export const getActiveEventsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    // Find only active events for this agent
    const activeEvents = await Event.find({ agentId, status: "active" })
      .select("eventName eventDate") 
      .sort({ eventDate: -1 }); 

    if (!activeEvents || activeEvents.length === 0) {
      return res
        .status(404)
        .json({ message: "No active events found for this agent" });
    }

    res.status(200).json(activeEvents);
  } catch (error) {
    console.error("getActiveEventsByAgent error:", error);
    res.status(500).json({ message: error.message });
  }
};

