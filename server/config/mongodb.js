import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("✅ Database Connected")
    );

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "event_management",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("Error Connecting to MongoDB ❌:", error);
    process.exit(1);
  }
};

export default connectDB;
