import Guest from "../models/Guest.js";
import moment from "moment-timezone";

// Create (Register Guest)
export const registerGuest = async (req, res) => {
  try {
    const { name, mobile, gifts, customMessage, otp, eventId, agentId } =
      req.body;

    if (!name || !mobile || !gifts || !otp || !eventId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Optional: prevent duplicate mobile+event registration
    const existingGuest = await Guest.findOne({ mobile, eventId });
    if (existingGuest) {
      return res.status(400).json({
        success: false,
        message: "Guest already registered for this event",
      });
    }

    const guest = new Guest({
      name,
      mobile,
      gifts,
      customMessage,
      otp,
      eventId,
      agentId,
    });

    await guest.save();
    res.status(201).json({ success: true, guest });
  } catch (error) {
    console.error("Error saving guest:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Read (All Guests)
export const getAllGuests = async (req, res) => {
  try {
    const { startDate, endDate, otpUsed, filterBy } = req.query;

    const query = {};

    // Filter by OTP status
    if (otpUsed === "true") query.otpUsed = true;
    if (otpUsed === "false") query.otpUsed = false;

    // Filter by date range
    if (startDate || endDate) {
      const field = filterBy === "verifiedAt" ? "verifiedAt" : "createdAt";  
      query[field] = {};
      if (startDate) query[field].$gte = new Date(startDate);
      if (endDate) query[field].$lte = new Date(endDate);
    }

    const guests = await Guest.find(query)
      .populate("gifts", "giftName giftImage")
      .populate("eventId", "eventName welcomeImage")
      .populate("agentId", "name email")
      .populate("verifiedBy", "name");

    const formattedGuests = guests.map((guest) => ({
      _id: guest._id,
      name: guest.name,
      mobile: guest.mobile,
      gifts: guest.gifts,
      customMessage: guest.customMessage,
      otp: guest.otp,
      otpUsed: guest.otpUsed,
      eventId: guest.eventId,
      agentId: guest.agentId,
      verifiedBy: guest.verifiedBy,
      verifiedAt: guest.verifiedAt
        ? moment(guest.verifiedAt).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
        : null,
      createdAt: moment(guest.createdAt).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(guest.updatedAt).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      status: guest.otpUsed ? "Claimed" : "Not Claimed",  
    }));

    res.json({ success: true, guests: formattedGuests });
  } catch (error) {
    console.error("Error fetching guests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Read verified guests for a particular event
export const getVerifiedGuests = async (req, res) => {
  try {
    const { eventId } = req.params; // optional: filter by event
    const query = { otpUsed: true };
    if (eventId) query.eventId = eventId;

    const guests = await Guest.find(query)
      .populate("gifts", "giftName giftImage")
      .populate("eventId", "eventName eventDate")
      .populate("verifiedBy", "name"); // agent who verified

    res.json({ success: true, guests });
  } catch (error) {
    console.error("Error fetching verified guests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { otp, eventId } = req.body;
    const agentId = req.user?.id;

    // Find guest for that event with OTP
    const guest = await Guest.findOne({ otp, eventId }).populate(
      "gifts",
      "giftName giftImage"
    );

    if (!guest) {
      return res.status(404).json({ success: false, message: "Invalid OTP" });
    }

    if (guest.otpUsed) {
      return res
        .status(400)
        .json({ success: false, message: "OTP already used" });
    }

    // Mark guest as verified
    guest.otpUsed = true;

    // Optional: track which agent verified
    if (agentId) guest.verifiedBy = agentId;

    await guest.save();

    // Count verified guests for this event
    const verifiedCount = await Guest.countDocuments({
      eventId,
      otpUsed: true,
    });

    res.json({
      success: true,
      guest,
      verifiedCount,
      message: "Guest verified successfully",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Guest
export const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedGuest = await Guest.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("gifts", "giftName giftImage")
      .populate("eventId", "eventName welcomeImage");

    if (!updatedGuest) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found" });
    }

    res.json({ success: true, guest: updatedGuest });
  } catch (error) {
    console.error("Error updating guest:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Guest
export const deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGuest = await Guest.findByIdAndDelete(id);

    if (!deletedGuest) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found" });
    }

    res.json({ success: true, message: "Guest deleted" });
  } catch (error) {
    console.error("Error deleting guest:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
