import express from "express";
import cors from "cors";
import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import giftRoutes from "./routes/giftRoute.js";
import eventRoutes from "./routes/eventRoute.js";
import guestRoutes from "./routes/guestRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// ES6 module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve static files (uploaded images) 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gifts", giftRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/guests", guestRoutes);

// Test route
app.get("/", (req, res) => res.send("API Is Working"));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  if (error.message === "Error: Images only!") {
    return res.status(400).json({ error: "Only image files are allowed" });
  }
  res.status(500).json({ error: "Server error" });
});

// Connect DB first, then start server
connectDB()
  .then(() => {
    app.listen(port, () => console.log(`✅ Server Started On PORT: ${port}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect DB, Server not started", err);
  });
